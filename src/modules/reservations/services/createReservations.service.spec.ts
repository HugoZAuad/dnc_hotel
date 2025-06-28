import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateReservationsService } from './createReservations.service';
import { CreateReservationDto } from '../domain/dto/create-reservation.dto';
import { ReservationStatus } from './createReservations.service';

jest.mock('date-fns', () => ({
  parseISO: jest.requireActual('date-fns').parseISO,
  differenceInDays: jest.fn().mockReturnValue(4),
}));

describe('CreateReservationsService', () => {
  let service: CreateReservationsService;
  let reservationsRepo: { create: jest.Mock };
  let hotelRepo: { findHotelById: jest.Mock };
  let findUserById: { show: jest.Mock };
  let mailerService: { sendMail: jest.Mock };

  beforeEach(async () => {
    reservationsRepo = { create: jest.fn() };
    hotelRepo = { findHotelById: jest.fn() };
    findUserById = { show: jest.fn() };
    mailerService = { sendMail: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReservationsService,
        {
          provide: 'RESERVATION_REPOSITORIES_TOKEN',
          useValue: reservationsRepo,
        },
        {
          provide: 'HOTEL_REPOSITORIES_TOKEN',
          useValue: hotelRepo,
        },
        {
          provide: MailerService,
          useValue: mailerService,
        },
        {
          provide: 'FindUserByIdService',
          useValue: findUserById,
        },
      ],
    }).compile();

    service = module.get<CreateReservationsService>(CreateReservationsService);
  });

  describe('create()', () => {
    const userId = 123;
    const dtoValido: CreateReservationDto = {
      hotelId: 99,
      checkIn: '2025-07-01',
      checkOut: '2025-07-05',
      status: ReservationStatus.PENDING,
    };
    const hotelMock = { id: 99, price: 100, ownerId: 55 };

    it('deve estar definido', () => {
      expect(service).toBeDefined();
    });

    it('deve lançar BadRequestException quando checkOut for antes ou igual ao checkIn', async () => {
      const dto = {
        ...dtoValido,
        checkIn: '2025-07-05',
        checkOut: '2025-07-01',
      };
      await expect(service.create(userId, dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('deve lançar NotFoundException quando o hotel não for encontrado', async () => {
      hotelRepo.findHotelById.mockResolvedValue(null);
      await expect(service.create(userId, dtoValido)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException quando o preço do hotel for inválido', async () => {
      hotelRepo.findHotelById.mockResolvedValue({
        ...hotelMock,
        price: 0,
      });
      await expect(service.create(userId, dtoValido)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('deve criar a reserva e enviar e-mail com sucesso', async () => {
      hotelRepo.findHotelById.mockResolvedValue(hotelMock);
      findUserById.show.mockResolvedValue({ email: 'owner@hotel.com' });
      reservationsRepo.create.mockResolvedValue({
        id: 1,
        ...dtoValido,
        total: 4 * hotelMock.price,
        userId,
        status: ReservationStatus.PENDING,
      });
      mailerService.sendMail.mockResolvedValue(null);

      const resultado = await service.create(userId, dtoValido);

      expect(hotelRepo.findHotelById).toHaveBeenCalledWith(dtoValido.hotelId);
      expect(findUserById.show).toHaveBeenCalledWith(hotelMock.ownerId);

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'owner@hotel.com',
          subject: 'Reserva pendente de aprovação',
          html: expect.any(String),
        }),
      );

      expect(reservationsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          total: 4 * hotelMock.price,
          status: ReservationStatus.PENDING,
        }),
      );

      expect(resultado).toEqual(
        expect.objectContaining({
          id: 1,
          total: 4 * hotelMock.price,
          userId,
        }),
      );
    });

    it('deve propagar erro genérico se ocorrer uma exceção inesperada', async () => {
      hotelRepo.findHotelById.mockImplementation(() => {
        throw new Error('erro inesperado');
      });
      await expect(service.create(userId, dtoValido)).rejects.toThrow(
        'erro inesperado',
      );
    });
  });
});

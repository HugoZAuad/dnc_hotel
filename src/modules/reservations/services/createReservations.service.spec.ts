import { Test, TestingModule } from '@nestjs/testing';
import { CreateReservationsService } from './createReservations.service';
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from '../domain/dto/create-reservation.dto';
import { ReservationStatus } from './createReservations.service';

jest.mock('date-fns', () => ({
  parseISO: jest.requireActual('date-fns').parseISO,
  differenceInDays: jest.fn(() => 4),
}));

describe('CreateReservationsService', () => {
  let service: CreateReservationsService;
  let reservationsRepo: { create: jest.Mock };
  let hotelRepo: { findHotelById: jest.Mock };
  let mailerService: { sendMail: jest.Mock };
  let findUserByIdService: { show: jest.Mock };

  beforeEach(async () => {
    reservationsRepo = { create: jest.fn() };
    hotelRepo = { findHotelById: jest.fn() };
    mailerService = { sendMail: jest.fn() };
    findUserByIdService = { show: jest.fn() };

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
          provide: require('../../users/services/findUserById.service')
            .FindUserByIdService,
          useValue: findUserByIdService,
        },
      ],
    }).compile();

    service = module.get(CreateReservationsService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    const userId = 1;
    const hotel = { id: 10, ownerId: 2, price: 100 };
    const dto: CreateReservationDto = {
      hotelId: 10,
      checkIn: '2025-08-01',
      checkOut: '2025-08-05',
      status: ReservationStatus.PENDING,
    };

    it('deve lançar BadRequestException quando checkOut for antes ou igual ao checkIn', async () => {
      await expect(
        service.create(userId, {
          ...dto,
          checkIn: '2025-08-05',
          checkOut: '2025-08-01',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('deve lançar NotFoundException quando hotel não for encontrado', async () => {
      hotelRepo.findHotelById.mockResolvedValue(null);

      await expect(service.create(userId, dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException quando preço do hotel for inválido', async () => {
      hotelRepo.findHotelById.mockResolvedValue({ ...hotel, price: 0 });

      await expect(service.create(userId, dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('deve criar reserva e enviar e-mail com sucesso', async () => {
      hotelRepo.findHotelById.mockResolvedValue(hotel);
      findUserByIdService.show.mockResolvedValue({
        id: 2,
        name: 'Dono Hotel',
        email: 'donohotel@exemplo.com',
      });
      reservationsRepo.create.mockResolvedValue({
        id: 42,
        ...dto,
        userId,
        total: 400,
      });

      const result = await service.create(userId, dto);

      expect(hotelRepo.findHotelById).toHaveBeenCalledWith(dto.hotelId);
      expect(findUserByIdService.show).toHaveBeenCalledWith(hotel.ownerId);
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'donohotel@exemplo.com',
          subject: expect.any(String),
          html: expect.any(String),
        }),
      );
      expect(reservationsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          hotelId: dto.hotelId,
          userId,
          total: 400,
        }),
      );
      expect(result).toEqual(expect.objectContaining({ id: 42 }));
    });

    it('deve lançar erro genérico se repositório estourar', async () => {
      hotelRepo.findHotelById.mockImplementation(() => {
        throw new Error('fail');
      });

      await expect(service.create(userId, dto)).rejects.toThrow('fail');
    });
  });
});

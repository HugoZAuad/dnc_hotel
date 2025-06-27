import { Test, TestingModule } from '@nestjs/testing';
import { CreateReservationsService } from './createReservations.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from 'src/modules/reservations/domain/dto/create-reservation.dto';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

jest.mock('../../prisma/prisma.service', () => ({
  PrismaService: class {
    $connect = jest.fn();
    $disconnect = jest.fn();
  },
}));

describe('CreateReservationsService', () => {
  let service: CreateReservationsService;
  let reservationsRepositoriesMock: { create: jest.Mock };
  let hotelRepositoriesMock: { findHotelById: jest.Mock };
  let mailerServiceMock: { sendMail: jest.Mock };
  let findUserByIdServiceMock: { show: jest.Mock };

  beforeEach(async () => {
    reservationsRepositoriesMock = { create: jest.fn() };
    hotelRepositoriesMock = { findHotelById: jest.fn() };
    mailerServiceMock = { sendMail: jest.fn() };
    findUserByIdServiceMock = { show: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        require('@nestjs-modules/mailer').MailerModule.forRoot({
          transport: 'smtp://user:pass@smtp.example.com:587',
        }),
      ],
      providers: [
        CreateReservationsService,
        { provide: 'RESERVATION_REPOSITORIES_TOKEN', useValue: reservationsRepositoriesMock },
        { provide: 'HOTEL_REPOSITORIES_TOKEN', useValue: hotelRepositoriesMock },
        { provide: 'FindUserByIdService', useValue: findUserByIdServiceMock },
      ],
    }).compile();

    service = module.get<CreateReservationsService>(CreateReservationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const userId = 1;
    const validHotel = { id: 1, price: 100, ownerId: 2 };
    const validReservationDto: CreateReservationDto = {
      hotelId: 1,
      checkIn: '2025-07-01',
      checkOut: '2025-07-05',
      status: ReservationStatus.PENDING,
    };

    it('should throw BadRequestException if checkOut is before or equal to checkIn', async () => {
      const invalidDto: CreateReservationDto = {
        hotelId: 1,
        checkIn: '2025-07-05',
        checkOut: '2025-07-01',
        status: ReservationStatus.PENDING,
      };
      await expect(service.create(userId, invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if hotel is not found', async () => {
      hotelRepositoriesMock.findHotelById.mockResolvedValue(null);
      await expect(service.create(userId, validReservationDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if hotel price is invalid', async () => {
      hotelRepositoriesMock.findHotelById.mockResolvedValue({ ...validHotel, price: 0 });
      await expect(service.create(userId, validReservationDto)).rejects.toThrow(BadRequestException);
    });

    it('should create reservation successfully and send email', async () => {
      hotelRepositoriesMock.findHotelById.mockResolvedValue(validHotel);
      findUserByIdServiceMock.show.mockResolvedValue({ email: 'owner@example.com' });
      reservationsRepositoriesMock.create.mockResolvedValue({ id: 1, ...validReservationDto, total: 400, userId, status: ReservationStatus.PENDING });
      mailerServiceMock.sendMail.mockResolvedValue(null);

      const result = await service.create(userId, validReservationDto);

      expect(hotelRepositoriesMock.findHotelById).toHaveBeenCalledWith(validReservationDto.hotelId);
      expect(findUserByIdServiceMock.show).toHaveBeenCalledWith(validHotel.ownerId);
      expect(mailerServiceMock.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'owner@example.com',
        subject: expect.any(String),
        html: expect.any(String),
      }));
      expect(reservationsRepositoriesMock.create).toHaveBeenCalledWith(expect.objectContaining({
        userId,
        total: 400,
        status: ReservationStatus.PENDING,
      }));
      expect(result).toEqual(expect.objectContaining({
        id: 1,
        total: 400,
        userId,
        status: ReservationStatus.PENDING,
      }));
    });

    it('should throw BadRequestException if hotelId is invalid', async () => {
      const invalidDto: CreateReservationDto = {
        hotelId: 0,
        checkIn: '2025-07-01',
        checkOut: '2025-07-05',
        status: ReservationStatus.PENDING,
      };
      await expect(service.create(userId, invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if checkIn is invalid date', async () => {
      const invalidDto: CreateReservationDto = {
        hotelId: 1,
        checkIn: 'invalid-date',
        checkOut: '2025-07-05',
        status: ReservationStatus.PENDING,
      };
      await expect(service.create(userId, invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if checkOut is invalid date', async () => {
      const invalidDto: CreateReservationDto = {
        hotelId: 1,
        checkIn: '2025-07-01',
        checkOut: 'invalid-date',
        status: ReservationStatus.PENDING,
      };
      await expect(service.create(userId, invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw generic error if unexpected exception occurs', async () => {
      hotelRepositoriesMock.findHotelById.mockImplementation(() => {
        throw new Error('Unexpected error');
      });
      const validDto: CreateReservationDto = {
        hotelId: 1,
        checkIn: '2025-07-01',
        checkOut: '2025-07-05',
        status: ReservationStatus.PENDING,
      };
      await expect(service.create(userId, validDto)).rejects.toThrow(Error);
    });
  });
});

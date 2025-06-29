import { Test, TestingModule } from '@nestjs/testing';
import { UpdateStatusReservationService } from './updateStatusReservations.service';
import { RESERVATION_REPOSITORIES_TOKEN } from '../utils/repositoriesReservation.Tokens';
import { MailerService } from '@nestjs-modules/mailer';
import { FindUserByIdService } from './../../users/services/findUserById.service';
import { ReservationStatus } from '../../../../generated/prisma/client';

describe('UpdateStatusReservationService', () => {
  let service: UpdateStatusReservationService;
  let reservationRepo: { updateStatus: jest.Mock };
  let mailerService: { sendMail: jest.Mock };
  let findUserByIdService: { show: jest.Mock };

  beforeEach(async () => {
    reservationRepo = { updateStatus: jest.fn() };
    mailerService = { sendMail: jest.fn() };
    findUserByIdService = { show: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateStatusReservationService,
        {
          provide: RESERVATION_REPOSITORIES_TOKEN,
          useValue: reservationRepo,
        },
        {
          provide: MailerService,
          useValue: mailerService,
        },
        {
          provide: FindUserByIdService,
          useValue: findUserByIdService,
        },
      ],
    }).compile();

    service = module.get<UpdateStatusReservationService>(
      UpdateStatusReservationService,
    );
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve atualizar status e enviar e-mail com sucesso', async () => {
    const reservationMock = {
      id: 7,
      userId: 99,
      status: ReservationStatus.APPROVED,
    };
    const userMock = { email: 'user@example.com', name: 'João' };

    reservationRepo.updateStatus.mockResolvedValue(reservationMock);
    findUserByIdService.show.mockResolvedValue(userMock);
    mailerService.sendMail.mockResolvedValue(null);

    const resultado = await service.execute(
      reservationMock.id,
      reservationMock.status,
    );

    // Verifica chamada ao repositório
    expect(reservationRepo.updateStatus).toHaveBeenCalledWith(
      reservationMock.id,
      reservationMock.status,
    );

    // Verifica busca de dados do usuário e envio de e-mail
    expect(findUserByIdService.show).toHaveBeenCalledWith(
      reservationMock.userId,
    );
    expect(mailerService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: userMock.email,
        subject: 'A sua reserva teve o status atualizado',
        html: expect.stringContaining(userMock.name),
      }),
    );

    // Retorna a reserva atualizada
    expect(resultado).toEqual(reservationMock);
  });

  it('deve propagar erro se updateStatus lançar exceção', async () => {
    reservationRepo.updateStatus.mockImplementation(() => {
      throw new Error('falha no updateStatus');
    });
    await expect(
      service.execute(1, ReservationStatus.CANCELED),
    ).rejects.toThrow('falha no updateStatus');
  });

  it('deve propagar erro se findUserByIdService.show lançar exceção', async () => {
    const reservationMock = { id: 5, userId: 42, status: ReservationStatus.PENDING };
    reservationRepo.updateStatus.mockResolvedValue(reservationMock);
    findUserByIdService.show.mockImplementation(() => {
      throw new Error('falha ao buscar usuário');
    });

    await expect(
      service.execute(reservationMock.id, reservationMock.status),
    ).rejects.toThrow('falha ao buscar usuário');
  });

  it('deve propagar erro se mailerService.sendMail lançar exceção', async () => {
    const reservationMock = {
      id: 3,
      userId: 11,
      status: ReservationStatus.APPROVED,
    };
    const userMock = { email: 'x@y.com', name: 'Maria' };

    reservationRepo.updateStatus.mockResolvedValue(reservationMock);
    findUserByIdService.show.mockResolvedValue(userMock);
    mailerService.sendMail.mockImplementation(() => {
      throw new Error('falha no envio de e-mail');
    });

    await expect(
      service.execute(reservationMock.id, reservationMock.status),
    ).rejects.toThrow('falha no envio de e-mail');
  });
});
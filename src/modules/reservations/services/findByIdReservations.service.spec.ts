import { Test, TestingModule } from '@nestjs/testing';
import { FindByIdReservationsService } from './findByIdReservations.service';
import { RESERVATION_REPOSITORIES_TOKEN } from '../utils/repositoriesReservation.Tokens';

describe('FindByIdReservationsService', () => {
  let service: FindByIdReservationsService;
  let reservationsRepo: { findById: jest.Mock };

  beforeEach(async () => {
    reservationsRepo = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindByIdReservationsService,
        {
          provide: RESERVATION_REPOSITORIES_TOKEN,
          useValue: reservationsRepo,
        },
      ],
    }).compile();

    service = module.get<FindByIdReservationsService>(
      FindByIdReservationsService,
    );
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar a reserva quando encontrada', async () => {
    const reservaMock = { id: 123, hotelId: 5, userId: 10, total: 500 };
    reservationsRepo.findById.mockResolvedValue(reservaMock);

    const resultado = await service.execute(123);

    expect(reservationsRepo.findById).toHaveBeenCalledWith(123);
    expect(resultado).toEqual(reservaMock);
  });

  it('deve retornar null quando a reserva não existir', async () => {
    reservationsRepo.findById.mockResolvedValue(null);

    const resultado = await service.execute(999);

    expect(reservationsRepo.findById).toHaveBeenCalledWith(999);
    expect(resultado).toBeNull();
  });

  it('deve propagar erro se o repositório lançar exceção', async () => {
    reservationsRepo.findById.mockImplementation(() => {
      throw new Error('falha inesperada');
    });

    await expect(service.execute(1)).rejects.toThrow('falha inesperada');
  });
});
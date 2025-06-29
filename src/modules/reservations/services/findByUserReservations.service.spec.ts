import { Test, TestingModule } from '@nestjs/testing';
import { FindByUserReservationsService } from './findByUserReservations.service';
import { RESERVATION_REPOSITORIES_TOKEN } from '../utils/repositoriesReservation.Tokens';

describe('FindByUserReservationsService', () => {
  let service: FindByUserReservationsService;
  let reservationsRepo: { findByUser: jest.Mock };

  beforeEach(async () => {
    reservationsRepo = { findByUser: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindByUserReservationsService,
        {
          provide: RESERVATION_REPOSITORIES_TOKEN,
          useValue: reservationsRepo,
        },
      ],
    }).compile();

    service = module.get<FindByUserReservationsService>(
      FindByUserReservationsService,
    );
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar as reservas do usuário quando existirem', async () => {
    const reservasMock = [
      { id: 1, userId: 42, hotelId: 5, total: 300 },
      { id: 2, userId: 42, hotelId: 7, total: 450 },
    ];
    reservationsRepo.findByUser.mockResolvedValue(reservasMock);

    const resultado = await service.execute(42);

    expect(reservationsRepo.findByUser).toHaveBeenCalledWith(42);
    expect(resultado).toEqual(reservasMock);
  });

  it('deve retornar array vazio quando não houver reservas para o usuário', async () => {
    reservationsRepo.findByUser.mockResolvedValue([]);

    const resultado = await service.execute(99);

    expect(reservationsRepo.findByUser).toHaveBeenCalledWith(99);
    expect(resultado).toEqual([]);
  });

  it('deve propagar erro se o repositório lançar exceção', async () => {
    reservationsRepo.findByUser.mockImplementation(() => {
      throw new Error('falha inesperada no repo');
    });

    await expect(service.execute(1)).rejects.toThrow(
      'falha inesperada no repo',
    );
  });
});
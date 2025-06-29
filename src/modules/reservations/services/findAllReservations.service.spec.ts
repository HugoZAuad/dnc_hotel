import { Test, TestingModule } from '@nestjs/testing';
import { FindAllReservationsService } from './findAllReservations.service';
import { RESERVATION_REPOSITORIES_TOKEN } from '../utils/repositoriesReservation.Tokens';
import { REDIS_RESERVATIONS_KEY } from '../utils/redisKey';

describe('FindAllReservationsService', () => {
  let service: FindAllReservationsService;
  let reservationsRepo: { findAll: jest.Mock; countReservations: jest.Mock };
  let redisClient: { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    reservationsRepo = {
      findAll: jest.fn(),
      countReservations: jest.fn(),
    };
    redisClient = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllReservationsService,
        {
          provide: RESERVATION_REPOSITORIES_TOKEN,
          useValue: reservationsRepo,
        },
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: redisClient,
        },
      ],
    }).compile();

    service = module.get(FindAllReservationsService);
  });

  it('deve retornar dados do cache quando existir cache', async () => {
    const mockData = [{ id: 1, hotelId: 10 }];
    redisClient.get.mockResolvedValue(JSON.stringify(mockData));
    reservationsRepo.countReservations.mockResolvedValue(20);

    const result = await service.execute();

    expect(redisClient.get).toHaveBeenCalledWith(REDIS_RESERVATIONS_KEY);
    expect(reservationsRepo.findAll).not.toHaveBeenCalled();
    expect(result.data).toEqual(mockData);
  });

  it('deve buscar do repositório e salvar no cache quando não houver cache', async () => {
    const data = [{ id: 2, hotelId: 5 }];
    redisClient.get.mockResolvedValue(null);
    reservationsRepo.findAll.mockResolvedValue(data);
    reservationsRepo.countReservations.mockResolvedValue(42);

    const result = await service.execute(2, 5);

    expect(reservationsRepo.findAll).toHaveBeenCalledWith(5, 5);
    expect(redisClient.set).toHaveBeenCalledWith(REDIS_RESERVATIONS_KEY, JSON.stringify(data));
    expect(result.page).toBe(2);
    expect(result.data).toEqual(data);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { FindAllReservationsService } from './findAllReservations.service';
import { RESERVATION_REPOSITORIES_TOKEN } from '../utils/repositoriesReservation.Tokens';

describe('FindAllReservationsService', () => {
  let service: FindAllReservationsService;
  let reservationsRepo: {
    findAll: jest.Mock;
    countReservations: jest.Mock;
  };
  let redisClient: {
    get: jest.Mock;
    set: jest.Mock;
  };

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
          provide: ('default_IORedisModuleConnectionToken'),
          useValue: redisClient,
        },
      ],
    }).compile();

    service = module.get<FindAllReservationsService>(
      FindAllReservationsService,
    );
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar dados do cache quando existir cache', async () => {
    const mockData = [{ id: 1, foo: 'bar' }];
    // simula cache JSON válido
    redisClient.get.mockResolvedValue(JSON.stringify(mockData));
    reservationsRepo.countReservations.mockResolvedValue(100);

    const result = await service.execute(); // page=1, limit=10

    expect(redisClient.get).toHaveBeenCalledWith('REDIS_RESERVATIONS_KEY');
    expect(reservationsRepo.findAll).not.toHaveBeenCalled();
    expect(redisClient.set).not.toHaveBeenCalled();

    expect(reservationsRepo.countReservations).toHaveBeenCalled();
    expect(result).toEqual({
      total: 100,
      page: 1,
      per_page: 10,
      data: mockData,
    });
  });

  it('deve buscar no repositório e popular cache quando não houver cache', async () => {
    const repoData = [{ id: 2, baz: 'qux' }];
    // simula ausência de cache
    redisClient.get.mockResolvedValue(null);
    reservationsRepo.findAll.mockResolvedValue(repoData);
    reservationsRepo.countReservations.mockResolvedValue(55);

    const result = await service.execute(2, 5);

    // cálculo do offset = (2-1)*5 = 5
    expect(reservationsRepo.findAll).toHaveBeenCalledWith(5, 5);
    expect(redisClient.set).toHaveBeenCalledWith(
      'REDIS_RESERVATIONS_KEY',
      JSON.stringify(repoData),
    );
    expect(reservationsRepo.countReservations).toHaveBeenCalled();

    expect(result).toEqual({
      total: 55,
      page: 2,
      per_page: 5,
      data: repoData,
    });
  });

  it('deve usar valores padrão quando page e limit não forem passados', async () => {
    // cache vazio, repositório vazio
    redisClient.get.mockResolvedValue(null);
    reservationsRepo.findAll.mockResolvedValue([]);
    reservationsRepo.countReservations.mockResolvedValue(0);

    const result = await service.execute();

    expect(reservationsRepo.findAll).toHaveBeenCalledWith(0, 10);
    expect(result).toEqual({
      total: 0,
      page: 1,
      per_page: 10,
      data: [],
    });
  });

  it('deve lançar exceção se ocorrer erro no Redis ou repositório', async () => {
    redisClient.get.mockImplementation(() => {
      throw new Error('falha no Redis');
    });
    await expect(service.execute()).rejects.toThrow('falha no Redis');
  });
});
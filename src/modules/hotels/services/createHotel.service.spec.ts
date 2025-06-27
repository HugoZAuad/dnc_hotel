import { Test, TestingModule } from '@nestjs/testing';
import { HOTEL_REPOSITORIES_TOKEN } from '../utils/repositoriesHotel.Tokens';
import { CreateHotelsService } from './createHotel.service';
import { IHotelRepositories } from '../domain/repositories/IHotel.repositories';
import { REDIS_HOTEL_KEY } from '../utils/redisKey';

let service: CreateHotelsService;
let hotelRepositories: IHotelRepositories;
let redis: { del: jest.Mock };

const createHotelMock = {
  id: 1,
  name: 'Hotel test',
  description: 'Um hotel para teste',
  image: 'imagem-test.png',
  price: 100,
  address: 'rua 1 da casa x',
  ownerId: 1,
  created_at: new Date(),
  updated_at: new Date(),
};

const userIdMock = 1;

describe('CreateHotelService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateHotelsService,
        {
          provide: HOTEL_REPOSITORIES_TOKEN,
          useValue: {
            createHotel: jest.fn().mockResolvedValue(createHotelMock),
          },
        },
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: {
            del: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<CreateHotelsService>(CreateHotelsService);
    hotelRepositories = module.get<IHotelRepositories>(
      HOTEL_REPOSITORIES_TOKEN,
    );
    redis = module.get('default_IORedisModuleConnectionToken');
  });

  it('Deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('Deve deletar o redis key', async () => {
      const redisDelSpy = jest.spyOn(redis, 'del').mockResolvedValue(1);
      await service.execute(createHotelMock, userIdMock);
      expect(redisDelSpy).toHaveBeenCalledWith(REDIS_HOTEL_KEY);
    });

    it('Deve criar um hotel', async () => {
      const result = await service.execute(createHotelMock, userIdMock);
      await service.execute(createHotelMock, userIdMock);
      expect(hotelRepositories.createHotel).toHaveBeenCalledWith(
        createHotelMock,
        userIdMock,
      );
      expect(result).toEqual(createHotelMock);
    });
  });
});

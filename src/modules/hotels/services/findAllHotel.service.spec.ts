import { Test, TestingModule } from '@nestjs/testing';
import { IHotelRepositories } from '../domain/repositories/IHotel.repositories';
import { FindAllHotelsService } from './findAllHotel.service';
import { HOTEL_REPOSITORIES_TOKEN } from '../utils/repositoriesHotel.Tokens';
import { Hotel } from 'generated/prisma';
import { REDIS_HOTEL_KEY } from '../utils/redisKey';

let service: FindAllHotelsService;
let hotelRepositories: IHotelRepositories;
let redis: { get: jest.Mock; set: jest.Mock };

const hotelMock: Hotel = {
  id: 1,
  name: 'Hotel test',
  description: 'Um hotel para teste',
  image: 'imagem-test.png',
  price: 100,
  address: 'rua 1 da casa x',
  ownerId: 1,
  created_at: new Date('2025-01-01T10:00:00Z'),
  updated_at: new Date('2025-01-01T10:00:00Z'),
};

describe('FindAllHotelsService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllHotelsService,
        {
          provide: HOTEL_REPOSITORIES_TOKEN,
          useValue: {
            findHotels: jest.fn().mockResolvedValue([hotelMock]),
            countHotels: jest.fn().mockResolvedValue(1),
          },
        },
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<FindAllHotelsService>(FindAllHotelsService);
    hotelRepositories = module.get<IHotelRepositories>(
      HOTEL_REPOSITORIES_TOKEN,
    );
    redis = module.get('default_IORedisModuleConnectionToken');
  });

  it('Deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('Deve returnar hotels validos do redis', async () => {
      const hotelsFromRedis = [hotelMock];
      redis.get.mockResolvedValue(JSON.stringify(hotelsFromRedis));
      const result = await service.execute();
      result.data.forEach(hotel => {
        hotel.created_at = new Date(hotel.created_at);
        hotel.updated_at = new Date(hotel.updated_at);
      });

      expect(redis.get).toHaveBeenCalledWith(REDIS_HOTEL_KEY);
      expect(result.data).toEqual(hotelsFromRedis);
    });

    it('deve buscar hotéis no repositório se não estiverem no redis e armazená-los em cache', async () => {
      redis.get.mockResolvedValue(null);
      const result = await service.execute();

      expect(redis.get).toHaveBeenCalledWith(REDIS_HOTEL_KEY);
      expect(hotelRepositories.findHotels).toHaveBeenCalledWith(0, 10);
      expect(hotelRepositories.countHotels).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalledWith(
        REDIS_HOTEL_KEY,
        JSON.stringify([hotelMock]),
      );
      expect(result.data).toEqual([hotelMock]);
      expect(result.total).toBe(1);
      expect(result).toEqual({
        total: 1,
        page: 1,
        per_page: 10,
        data: [hotelMock],
      });
    });

    it('deve retornar a correta paginação do metadados', async () => {
      redis.get.mockResolvedValue(null);

      const page = 2;
      const limit = 5;
      const result = await service.execute(page, limit);

      expect(hotelRepositories.findHotels).toHaveBeenCalledWith(5, 5);
      expect(result.page).toEqual(page);
      expect(result.per_page).toEqual(limit);
    });

    it('deve returnar que o formato da imagem do hotel esta correta', async () => {
      const hotelWithImage = { ...hotelMock, image: 'image.jpg' };
      redis.get.mockResolvedValue(null);
      (hotelRepositories.findHotels as jest.Mock).mockResolvedValue([
        hotelWithImage,
      ]);

      const result = await service.execute();

      expect(result.data[0].image).toMatch(/\.(jpg|jpeg|png|gif|bmp)$/i);
    });
  });
});

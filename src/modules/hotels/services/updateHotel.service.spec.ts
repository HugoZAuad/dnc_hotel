import { Test, TestingModule } from '@nestjs/testing';
import { UpdateHotelsService } from './updateHotel.service';
import { REDIS_HOTEL_KEY } from '../utils/redisKey';

describe('UpdateHotelsService', () => {
  let service: UpdateHotelsService;
  let hotelRepositoriesMock: { updateHotel: jest.Mock };
  let redisMock: { del: jest.Mock };

  beforeEach(async () => {
    hotelRepositoriesMock = {
      updateHotel: jest.fn(),
    };
    redisMock = {
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateHotelsService,
        {
          provide: 'HOTEL_REPOSITORIES_TOKEN',
          useValue: hotelRepositoriesMock,
        },
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: redisMock,
        },
      ],
    }).compile();

    service = module.get<UpdateHotelsService>(UpdateHotelsService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('deve chamar redis.del com REDIS_HOTEL_KEY, chamar hotelRepositories.updateHotel com id e DTO e retornar o resultado', async () => {
      const id = 1;
      const updateHotelDto = {
        name: 'Hotel Atualizado',
        address: 'Rua Atualizada, 456',
        description: 'Descrição atualizada',
        price: 150,
        ownerId: 1,
      };
      const updateResult = { id, ...updateHotelDto };
      hotelRepositoriesMock.updateHotel.mockResolvedValue(updateResult);

      redisMock.del.mockResolvedValue(1);

      const result = await service.execute(id, updateHotelDto);

      expect(redisMock.del).toHaveBeenCalledWith(REDIS_HOTEL_KEY);
      expect(hotelRepositoriesMock.updateHotel).toHaveBeenCalledWith(id, updateHotelDto);
      expect(result).toBe(updateResult);
    });
  });
});

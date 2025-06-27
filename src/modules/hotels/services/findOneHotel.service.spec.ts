import { Test, TestingModule } from '@nestjs/testing';
import { FindOneHotelsService } from './findOneHotel.service';

describe('FindOneHotelsService', () => {
  let service: FindOneHotelsService;
  let hotelRepositoriesMock: { findHotelById: jest.Mock };

  beforeEach(async () => {
    hotelRepositoriesMock = {
      findHotelById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneHotelsService,
        {
          provide: 'HOTEL_REPOSITORIES_TOKEN',
          useValue: hotelRepositoriesMock,
        },
      ],
    }).compile();

    service = module.get<FindOneHotelsService>(FindOneHotelsService);
  });

  describe('execute', () => {
    it('deve estar definido', () => {
      expect(service).toBeDefined();
    });

    it('deve chamar hotelRepositories.findHotelById com o id e retornar o resultado', async () => {
      const id = 1;
      const expectedResult = { id: 1, name: 'Hotel Teste' };
      hotelRepositoriesMock.findHotelById.mockResolvedValue(expectedResult);

      const result = await service.execute(id);

      expect(hotelRepositoriesMock.findHotelById).toHaveBeenCalledWith(id);
      expect(result).toBe(expectedResult);
    });
  });
});

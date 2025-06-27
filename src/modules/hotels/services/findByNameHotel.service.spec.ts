import { Test, TestingModule } from '@nestjs/testing';
import { FindByNameHotelService } from './findByNameHotel.service';

describe('FindByNameHotelService', () => {
  let service: FindByNameHotelService;
  let hotelRepositoriesMock: { findHotelByName: jest.Mock };

  beforeEach(async () => {
    hotelRepositoriesMock = {
      findHotelByName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindByNameHotelService,
        {
          provide: 'HOTEL_REPOSITORIES_TOKEN',
          useValue: hotelRepositoriesMock,
        },
      ],
    }).compile();

    service = module.get<FindByNameHotelService>(FindByNameHotelService);
  });

  describe('execute', () => {
    it('deve estar definido', () => {
      expect(service).toBeDefined();
    });

    it('deve chamar hotelRepositories.findHotelByName com o nome e retornar o resultado', async () => {
      const name = 'Hotel Teste';
      const expectedResult = [{ id: 1, name: 'Hotel Teste' }];
      hotelRepositoriesMock.findHotelByName.mockResolvedValue(expectedResult);

      const result = await service.execute(name);

      expect(hotelRepositoriesMock.findHotelByName).toHaveBeenCalledWith(name);
      expect(result).toBe(expectedResult);
    });
  });
});

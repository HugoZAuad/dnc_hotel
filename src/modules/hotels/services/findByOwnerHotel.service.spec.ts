import { Test, TestingModule } from '@nestjs/testing';
import { FindByOwnerHotelService } from './findByOwnerHotel.service';

describe('FindByOwnerHotelService', () => {
  let service: FindByOwnerHotelService;
  let hotelRepositoriesMock: { findHotelByOwner: jest.Mock };

  beforeEach(async () => {
    hotelRepositoriesMock = {
      findHotelByOwner: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindByOwnerHotelService,
        {
          provide: 'HOTEL_REPOSITORIES_TOKEN',
          useValue: hotelRepositoriesMock,
        },
      ],
    }).compile();

    service = module.get<FindByOwnerHotelService>(FindByOwnerHotelService);
  });

  describe('execute', () => {
    it('deve estar definido', () => {
    expect(service).toBeDefined();
  });
    it('deve chamar hotelRepositories.findHotelByOwner com o ownerId e retornar o resultado', async () => {
      const ownerId = 1;
      const expectedResult = [{ id: 1, ownerId: 1, name: 'Hotel Teste' }];
      hotelRepositoriesMock.findHotelByOwner.mockResolvedValue(expectedResult);

      const result = await service.execute(ownerId);

      expect(hotelRepositoriesMock.findHotelByOwner).toHaveBeenCalledWith(ownerId);
      expect(result).toBe(expectedResult);
    });
  });
});

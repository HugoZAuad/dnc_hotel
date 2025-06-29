import { Test, TestingModule } from '@nestjs/testing';
import { DeleteHotelsService } from './deleteHotel.Service';

describe('DeleteHotelsService', () => {
  let service: DeleteHotelsService;
  let hotelRepositoriesMock: { deleteHotel: jest.Mock; createHotel?: jest.Mock };
  let redisMock: { del: jest.Mock };

  beforeEach(async () => {
    hotelRepositoriesMock = {
      deleteHotel: jest.fn(),
    };
    redisMock = {
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteHotelsService,
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

    service = module.get<DeleteHotelsService>(DeleteHotelsService);
  });

  describe('execute', () => {
      it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

    it('deve chamar hotelRepositories.deleteHotel com o id e o delete deve ser bem sucedido', async () => {
      const id = 1;
      hotelRepositoriesMock.deleteHotel.mockResolvedValue({ deleted: true });

      redisMock.del.mockResolvedValue(1);

      const result = await service.execute(id);

      expect(hotelRepositoriesMock.deleteHotel).toHaveBeenCalledWith(id);
      expect(result).toEqual({ deleted: true });
    });

    it('deve simular criação e remoção de hotel', async () => {
      const { CreateHotelsService } = await import('./createHotel.service');

      hotelRepositoriesMock.createHotel = jest.fn();
      hotelRepositoriesMock.deleteHotel = jest.fn();

      redisMock.del.mockResolvedValue(1);

      const createService = new CreateHotelsService(
        hotelRepositoriesMock as any,
        redisMock as any
      );

      const createHotelDto = {
        name: 'Hotel Teste',
        address: 'Rua Teste, 123',
        description: 'Descrição do hotel',
        price: 100,
        ownerId: 1,
      };
      const userId = 1;

      const createdHotel = { id: 10, ...createHotelDto };
      hotelRepositoriesMock.createHotel.mockResolvedValue(createdHotel);
      hotelRepositoriesMock.deleteHotel.mockResolvedValue({ deleted: true });

      const resultCreate = await createService.execute(createHotelDto, userId);
      expect(hotelRepositoriesMock.createHotel).toHaveBeenCalledWith(createHotelDto, userId);
      expect(resultCreate).toBe(createdHotel);

      const resultDelete = await service.execute(createdHotel.id);
      expect(hotelRepositoriesMock.deleteHotel).toHaveBeenCalledWith(createdHotel.id);
      expect(resultDelete).toEqual({ deleted: true });
    });
  });
});

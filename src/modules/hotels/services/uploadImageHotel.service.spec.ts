import { Hotel } from 'generated/prisma/client';
import { IHotelRepositories } from './../domain/repositories/IHotel.repositories';
import { UploadImageHotelService } from './uploadImageHotel.service';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { stat, unlink } from 'fs/promises';
import { resolve } from 'path';
import { REDIS_HOTEL_KEY } from '../utils/redisKey';

let service: UploadImageHotelService;
let hotelRepository: IHotelRepositories;
let redis: { del: jest.Mock };

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

jest.mock('fs/promises', () => ({
  stat: jest.fn(),
  unlink: jest.fn(),
}));

describe('UploadImageHotelService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadImageHotelService,
        {
          provide: 'HOTEL_REPOSITORIES_TOKEN',
          useValue: {
            findHotelById: jest.fn().mockResolvedValue(hotelMock),
            updateHotel: jest.fn().mockResolvedValue(hotelMock),
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
    service = module.get<UploadImageHotelService>(UploadImageHotelService);
    hotelRepository = module.get<IHotelRepositories>(
      'HOTEL_REPOSITORIES_TOKEN',
    );
    redis = module.get('default_IORedisModuleConnectionToken');
  });

  it('Deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('Deve lançar o erro NotFoundException se o hotel não for encontrado', async () => {
    (hotelRepository.findHotelById as jest.Mock).mockResolvedValue(null);
    const result = service.execute('1', 'new-image.png');
    await expect(result).rejects.toThrow(NotFoundException);
  });

  it('Deve deletar a imagem antiga se existir', async () => {
    (stat as jest.Mock).mockResolvedValue(true);
    await service.execute('1', 'new-image.png');

    const directory = resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'uploads-hotel',
    );
    const hotelImageFilePath = resolve(directory, hotelMock.image);

    expect(stat).toHaveBeenCalledWith(hotelImageFilePath);
    expect(unlink).toHaveBeenCalledWith(hotelImageFilePath);
  });

  it('Não deve retornar um erro se a imagem antiga não existir', async () => {
    (stat as jest.Mock).mockResolvedValue(null);

    await expect(service.execute('1', 'new-image.png')).resolves.not.toThrow();
  });

  it('Deve atualizar a imagem o hotel com uma nova imagem', async () => {
    (hotelRepository.findHotelById as jest.Mock).mockResolvedValue(hotelMock);
    (stat as jest.Mock).mockResolvedValue(true);

    await service.execute('1', 'new-image.png');

    expect(hotelRepository.updateHotel).toHaveBeenCalledWith(1, {
      image: 'new-image.png',
    });
  });

  it('Deve deletar a chave do Redis associada ao hotel', async () => {
    await service.execute('1', 'new-image.png');
    expect(redis.del).toHaveBeenCalledWith(REDIS_HOTEL_KEY);
  });
});

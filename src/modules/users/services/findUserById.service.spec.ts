import { Test, TestingModule } from '@nestjs/testing';
import { FindUserByIdService } from './findUserById.service';
import { NotFoundException } from '@nestjs/common';
import { USER_REPOSITORIES_TOKEN } from '../utils/repositoriesUser.Tokens';

describe('FindUserByIdService', () => {
  let service: FindUserByIdService;
  let userRepo: { findById: jest.Mock };

  beforeEach(async () => {
    userRepo = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserByIdService,
        {
          provide: USER_REPOSITORIES_TOKEN,
          useValue: userRepo,
        },
      ],
    }).compile();

    service = module.get(FindUserByIdService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar o usuário quando encontrado', async () => {
    const usuario = { id: 1, name: 'João', email: 'joao@exemplo.com' };
    userRepo.findById.mockResolvedValue(usuario);

    const resultado = await service.show(1);

    expect(userRepo.findById).toHaveBeenCalledWith(1);
    expect(resultado).toEqual(usuario);
  });

  it('deve lançar NotFoundException quando o usuário não for encontrado', async () => {
    userRepo.findById.mockResolvedValue(null);

    await expect(service.show(999)).rejects.toBeInstanceOf(NotFoundException);
    expect(userRepo.findById).toHaveBeenCalledWith(999);
  });
});

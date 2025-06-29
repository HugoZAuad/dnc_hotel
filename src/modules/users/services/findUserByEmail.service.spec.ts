import { Test, TestingModule } from '@nestjs/testing';
import { FindUserByEmailService } from './findUserByEmail.service';
import { NotFoundException } from '@nestjs/common';
import { USER_REPOSITORIES_TOKEN } from '../utils/repositoriesUser.Tokens';

describe('FindUserByEmailService', () => {
  let service: FindUserByEmailService;
  let userRepo: { findByEmail: jest.Mock };

  beforeEach(async () => {
    userRepo = { findByEmail: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserByEmailService,
        { provide: USER_REPOSITORIES_TOKEN, useValue: userRepo },
      ],
    }).compile();

    service = module.get(FindUserByEmailService);
  });

  it('deve retornar usuário se encontrado', async () => {
    const user = { id: 1, email: 'joao@mail.com' };
    userRepo.findByEmail.mockResolvedValue(user);

    const resultado = await service.findByEmail('joao@mail.com');

    expect(resultado).toEqual(user);
  });

  it('deve lançar exceção se não encontrar o usuário', async () => {
    userRepo.findByEmail.mockResolvedValue(null);
    await expect(service.findByEmail('x@y.com')).rejects.toBeInstanceOf(NotFoundException);
  });
});

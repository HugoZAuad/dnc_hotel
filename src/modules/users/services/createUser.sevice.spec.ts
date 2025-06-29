import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserService } from './createUser.service';
import { BadRequestException } from '@nestjs/common';
import { USER_REPOSITORIES_TOKEN } from '../utils/repositoriesUser.Tokens';
import { REDIS_HOTEL_KEY } from '../../hotels/utils/redisKey';
import { createUserDTO } from '../domain/dto/createUser.dto';
import * as bcrypt from 'bcrypt';

describe('CreateUserService', () => {
  let service: CreateUserService;
  let userRepo: { findByEmail: jest.Mock; create: jest.Mock };
  let redisClient: { del: jest.Mock };

  beforeEach(async () => {
    userRepo = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    redisClient = {
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserService,
        {
          provide: USER_REPOSITORIES_TOKEN,
          useValue: userRepo,
        },
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: redisClient,
        },
      ],
    }).compile();

    service = module.get(CreateUserService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve lançar exceção se e-mail já estiver cadastrado', async () => {
    userRepo.findByEmail.mockResolvedValue({
      id: 1,
      email: 'existente@mail.com',
    });

    const dto: createUserDTO = {
      name: 'Novo Usuário',
      email: 'existente@mail.com',
      password: '123456',
      role: 'USER'
    };

    await expect(service.execute(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('deve criar um novo usuário com senha criptografada', async () => {
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.create.mockImplementation(user => ({
      id: 1,
      ...user,
    }));

    const dto: createUserDTO = {
        name: 'Novo',
        email: 'novo@teste.com',
        password: 'senhaSegura',
        role: 'USER'
    };

    const resultado = await service.execute(dto);

    expect(redisClient.del).toHaveBeenCalledWith(REDIS_HOTEL_KEY);
    expect(userRepo.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(userRepo.create).toHaveBeenCalled();
    expect(await bcrypt.compare('senhaSegura', resultado.password)).toBe(true);
    expect(resultado).toEqual(
      expect.objectContaining({ id: 1, email: dto.email }),
    );
  });
});

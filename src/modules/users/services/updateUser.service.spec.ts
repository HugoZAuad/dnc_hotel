import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserService } from './updateUser.service';
import { USER_REPOSITORIES_TOKEN } from '../utils/repositoriesUser.Tokens';
import { REDIS_HOTEL_KEY } from 'src/modules/hotels/utils/redisKey';

jest.mock('../../prisma/utils/userUtils', () => ({
  isIdExists: jest.fn().mockResolvedValue({ id: 1 }),
  hashPassword: jest.fn(async (senha: string) => `hashed-${senha}`),
}));

describe('UpdateUserService', () => {
  let service: UpdateUserService;
  let userRepo: { update: jest.Mock };
  let redisMock: { del: jest.Mock };

  beforeEach(async () => {
    userRepo = { update: jest.fn() };
    redisMock = { del: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserService,
        { provide: USER_REPOSITORIES_TOKEN, useValue: userRepo },
        { provide: 'default_IORedisModuleConnectionToken', useValue: redisMock },
      ],
    }).compile();

    service = module.get(UpdateUserService);
  });

  it('deve atualizar usuário com senha criptografada', async () => {
    userRepo.update.mockResolvedValue({ id: 1, name: 'Atualizado' });

    const dto = { name: 'Atualizado', password: 'novaSenha' };

    const result = await service.execute(1, dto);

    expect(redisMock.del).toHaveBeenCalledWith(REDIS_HOTEL_KEY);
    expect(userRepo.update).toHaveBeenCalledWith(1, {
      name: 'Atualizado',
      password: 'hashed-novaSenha',
    });
    expect(result.id).toBe(1);
  });

  it('deve atualizar usuário sem alterar senha', async () => {
    userRepo.update.mockResolvedValue({ id: 2, name: 'SemSenha' });

    const result = await service.execute(2, { name: 'SemSenha' });

    expect(userRepo.update).toHaveBeenCalledWith(2, { name: 'SemSenha' });
    expect(result.name).toBe('SemSenha');
  });
});

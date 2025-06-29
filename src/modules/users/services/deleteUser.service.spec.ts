import { Test, TestingModule } from '@nestjs/testing';
import { DeleteUserService } from './deleteUser.service';
import { USER_REPOSITORIES_TOKEN } from '../utils/repositoriesUser.Tokens';
import { REDIS_USERS_KEY } from '../utils/redisKey';

jest.mock('../../prisma/utils/userUtils', () => ({
  isIdExists: jest.fn().mockResolvedValue({ id: 1 }),
}));

describe('DeleteUserService', () => {
  let service: DeleteUserService;
  let userRepo: { delete: jest.Mock };
  let redis: { del: jest.Mock };

  beforeEach(async () => {
    userRepo = { delete: jest.fn() };
    redis = { del: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserService,
        { provide: USER_REPOSITORIES_TOKEN, useValue: userRepo },
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: redis,
        },
      ],
    }).compile();

    service = module.get(DeleteUserService);
  });

  it('deve deletar usuário e limpar cache do Redis', async () => {
    userRepo.delete.mockResolvedValue({ id: 1, name: 'Usuário Excluído' });

    const resultado = await service.execute(1);

    expect(redis.del).toHaveBeenCalledWith(REDIS_USERS_KEY);
    expect(userRepo.delete).toHaveBeenCalledWith(1);
    expect(resultado).toEqual(expect.objectContaining({ id: 1 }));
  });
});

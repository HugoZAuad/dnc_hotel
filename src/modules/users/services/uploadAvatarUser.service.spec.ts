import { Test, TestingModule } from '@nestjs/testing';
import { UploadAvatarUserService } from './uploadAvatarUser.service';
import { USER_REPOSITORIES_TOKEN } from '../utils/repositoriesUser.Tokens';
import { REDIS_USERS_KEY } from '../utils/redisKey';
import * as fs from 'fs/promises';

jest.mock('fs/promises');
jest.mock('../../prisma/utils/userUtils', () => ({
  isIdExists: jest.fn().mockResolvedValue({ id: 1, avatar: 'old.png' }),
}));

describe('UploadAvatarUserService', () => {
  let service: UploadAvatarUserService;
  let userRepo: { update: jest.Mock };
  let redisClient: { del: jest.Mock };

  beforeEach(async () => {
    userRepo = { update: jest.fn() };
    redisClient = { del: jest.fn() };

    (fs.stat as jest.Mock).mockReset();
    (fs.unlink as jest.Mock).mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadAvatarUserService,
        { provide: USER_REPOSITORIES_TOKEN, useValue: userRepo },
        { provide: 'default_IORedisModuleConnectionToken', useValue: redisClient },
      ],
    }).compile();

    service = module.get(UploadAvatarUserService);
  });

  it('deve substituir avatar existente e remover o antigo', async () => {
    (fs.stat as jest.Mock).mockResolvedValueOnce(true);
    (fs.unlink as jest.Mock).mockResolvedValueOnce(undefined);
    userRepo.update.mockResolvedValue({ id: 1, avatar: 'new.png' });

    const result = await service.execute(1, 'new.png');

    expect(fs.stat).toHaveBeenCalled();
    expect(fs.unlink).toHaveBeenCalled();
    expect(redisClient.del).toHaveBeenCalledWith(REDIS_USERS_KEY);
    expect(userRepo.update).toHaveBeenCalledWith(1, { avatar: 'new.png' });
    expect(result.avatar).toBe('new.png');
  });

  it('deve ignorar remoção se avatar antigo não existir', async () => {
    (fs.stat as jest.Mock).mockRejectedValue(new Error('arquivo não encontrado'));
    userRepo.update.mockResolvedValue({ id: 1, avatar: 'new.png' });

    const result = await service.execute(1, 'new.png');

    expect(fs.unlink).not.toHaveBeenCalled();
    expect(redisClient.del).toHaveBeenCalledWith(REDIS_USERS_KEY);
    expect(userRepo.update).toHaveBeenCalledWith(1, { avatar: 'new.png' });
    expect(result.avatar).toBe('new.png');
  });
});

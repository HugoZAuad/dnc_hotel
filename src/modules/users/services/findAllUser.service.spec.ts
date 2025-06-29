import { Test, TestingModule } from '@nestjs/testing';
import { FindAllUserService } from './findAllUser.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('FindAllUserService', () => {
  let service: FindAllUserService;
  let prisma: { user: { findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      user: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllUserService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FindAllUserService);
  });

  it('deve retornar todos os usuários com os campos definidos', async () => {
    const usuariosMock = [{ id: 1, email: 'a@b.com' }];
    prisma.user.findMany.mockResolvedValue(usuariosMock);

    const resultado = await service.findAll();

    expect(prisma.user.findMany).toHaveBeenCalled();
    expect(resultado).toEqual(usuariosMock);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Role } from 'generated/prisma/client';
import * as jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';

jest.setTimeout(30000);

jest.mock('ioredis', () => {
  const mockRedis = jest.fn().mockImplementation(() => ({
    del: jest.fn().mockResolvedValue(1),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(null),
    quit: jest.fn().mockResolvedValue(null),
  }));
  return { __esModule: true, default: mockRedis, Redis: mockRedis };
});

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redisClient: Redis;

  let userId: number;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    redisClient = new Redis();

    await app.init();

    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@teste.com.br',
        password: '123456',
        role: Role.ADMIN,
      },
    });

    const normalUser = await prisma.user.create({
      data: {
        name: 'User',
        email: 'user@teste.com.br',
        password: '123456',
        role: Role.USER,
      },
    });

    userId = normalUser.id;

    adminToken = jwt.sign({ sub: admin.id, role: Role.ADMIN }, process.env.JWT_SECRET, {
      expiresIn: '1h', issuer: 'dnc_hotel', audience: 'users',
    });

    userToken = jwt.sign({ sub: normalUser.id, role: Role.USER }, process.env.JWT_SECRET, {
      expiresIn: '1h', issuer: 'dnc_hotel', audience: 'users',
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await redisClient.quit();
    await app.close();
  });

  it('/users (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/users/:id (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', userId);
  });

  it('/users/:id (PATCH)', async () => {
    const updateDto = { name: 'Updated User' };

    const res = await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updateDto)
      .expect(200);

    expect(res.body.name).toBe('Updated User');
  });

  it('/users/avatar (POST)', async () => {
    await request(app.getHttpServer())
      .post('/users/avatar')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('avatar', Buffer.from([0xff, 0xd8, 0xff]), 'avatar.jpg')
      .expect(201);
  });

  it('/users/:id (DELETE)', async () => {
    await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
  });
});

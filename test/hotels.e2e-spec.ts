import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Role } from 'generated/prisma/client';
import * as jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';
import { CreateHotelDTO } from 'src/modules/hotels/domain/dto/createHotel.dto';
import { UpdateHotelDTO } from 'src/modules/hotels/domain/dto/updateHotel.dto';

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

describe('HotelsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;
  let redis: Redis;
  let hotelId: number;
  let adminId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    redis = new Redis();

    await app.init();

    const admin = await prisma.user.create({
      data: { name: 'Admin', email: 'admin@e2e.com', password: '123456', role: Role.ADMIN },
    });

    const user = await prisma.user.create({
      data: { name: 'User', email: 'user@e2e.com', password: '123456', role: Role.USER },
    });

    adminId = admin.id;

    adminToken = jwt.sign({ sub: admin.id, role: Role.ADMIN }, process.env.JWT_SECRET, {
      expiresIn: '1h',
      issuer: 'dnc_hotel',
      audience: 'users',
    });

    userToken = jwt.sign({ sub: user.id, role: Role.USER }, process.env.JWT_SECRET, {
      expiresIn: '1h',
      issuer: 'dnc_hotel',
      audience: 'users',
    });
  });

  afterAll(async () => {
    await prisma.hotel.deleteMany({});
    await prisma.user.deleteMany({});
    await redis.quit();
    await app.close();
  });

  it('/hotels (POST)', async () => {
    const dto: CreateHotelDTO = {
      name: 'Hotel E2E',
      description: 'Test hotel',
      price: 150,
      address: 'Rua Teste',
      ownerId: adminId,
    };

    const res = await request(app.getHttpServer())
      .post('/hotels')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(dto)
      .expect(201);

    hotelId = res.body.id;

    expect(res.body).toMatchObject({
      name: dto.name,
      address: dto.address,
      price: dto.price,
    });
  });

  it('/hotels (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/hotels')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('/hotels/:id (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/hotels/${hotelId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.id).toBe(hotelId);
  });

  it('/hotels/:id (PATCH)', async () => {
    const dto: UpdateHotelDTO = { name: 'Hotel Atualizado' };

    const res = await request(app.getHttpServer())
      .patch(`/hotels/${hotelId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(dto)
      .expect(200);

    expect(res.body.name).toBe(dto.name);
  });

  it('/hotels/image/:hotelId (PATCH)', async () => {
    await request(app.getHttpServer())
      .patch(`/hotels/image/${hotelId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('avatar', Buffer.from([0xff, 0xd8, 0xff]), 'image.jpg')
      .expect(200);
  });

  it('/hotels/:id (DELETE)', async () => {
    await request(app.getHttpServer())
      .delete(`/hotels/${hotelId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});

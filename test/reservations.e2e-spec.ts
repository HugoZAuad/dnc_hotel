import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Role, ReservationStatus } from 'generated/prisma/client';
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

describe('ReservationsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redisClient: Redis;

  let adminToken: string;
  let userToken: string;
  let hotelId: number;
  let reservationId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    redisClient = new Redis();
    prisma = app.get(PrismaService);

    await app.init();

    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@teste.com.br',
        password: '123456',
        role: Role.ADMIN,
      },
    });

    const user = await prisma.user.create({
      data: {
        name: 'User',
        email: 'user@teste.com.br',
        password: '123456',
        role: Role.USER,
      },
    });

    const hotel = await prisma.hotel.create({
      data: {
        name: 'Hotel E2E',
        description: 'Hotel criado para teste',
        price: 200,
        address: 'Rua de Testes, 123',
        ownerId: admin.id,
      },
    });

    hotelId = hotel.id;

    adminToken = jwt.sign(
      { sub: admin.id, role: Role.ADMIN },
      process.env.JWT_SECRET,
      { expiresIn: '1h', issuer: 'dnc_hotel', audience: 'users' },
    );

    userToken = jwt.sign(
      { sub: user.id, role: Role.USER },
      process.env.JWT_SECRET,
      { expiresIn: '1h', issuer: 'dnc_hotel', audience: 'users' },
    );
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany({});
    await prisma.hotel.deleteMany({});
    await prisma.user.deleteMany({});
    await redisClient.quit();
    await app.close();
  });

  it('/reservations (POST)', async () => {
    const dto = {
      hotelId,
      checkIn: '2025-07-01',
      checkOut: '2025-07-05',
    };

    const res = await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${userToken}`)
      .send(dto)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.hotelId).toBe(hotelId);

    reservationId = res.body.id;
  });

  it('/reservations (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/reservations')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('/reservations/user (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/reservations/user')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('hotel');
  });

  it('/reservations/:id (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.id).toBe(reservationId);
  });

  it('/reservations/:id (PATCH)', async () => {
    const dto = { status: ReservationStatus.APPROVED };

    const res = await request(app.getHttpServer())
      .patch(`/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(dto)
      .expect(200);

    expect(res.body.status).toBe(ReservationStatus.APPROVED);
  });
});

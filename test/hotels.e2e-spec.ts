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
  const moduleRedis = jest.fn().mockImplementation(() => ({
    del: jest.fn().mockResolvedValue(1),
    get: jest.fn().mockResolvedValue(JSON.stringify([{ key: 'mock-value' }])),
    quit: jest.fn().mockResolvedValue(null),
  }));
  return { __esModule: true, default: moduleRedis, Redis: moduleRedis };
});

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;
  let redisCliente: Redis;
  let hotelId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    redisCliente = new Redis();
    prisma = app.get(PrismaService);

    await app.init();

    const adminUser = await prisma.user.create({
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

    adminToken = jwt.sign(
      { sub: adminUser.id, role: Role.ADMIN },
      process.env.JWT_SECRET,
      { expiresIn: '1h', issuer: 'dnc_hotel', audience: 'users' },
    );

    userToken = jwt.sign(
      { sub: normalUser.id, role: Role.USER },
      process.env.JWT_SECRET,
      { expiresIn: '1h', issuer: 'dnc_hotel', audience: 'users' },
    );
  });

  afterAll(async () => {
    await prisma.hotel.deleteMany({});
    await prisma.user.deleteMany({});
    await redisCliente.quit();
    await app.close();
  });

  it('/hotels (POST)', async () => {
    const createHotelDto: CreateHotelDTO = {
      name: 'test hotel',
      description: 'A test hotel for e2e testing',
      price: 100,
      address: '123 Test St, Test City, TC 12345',
      ownerId: 1,
    };

    const response = await request(app.getHttpServer())
      .post('/hotels')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(createHotelDto)
      .expect(201);

    hotelId = response.body.id;

    expect(response.body).toMatchObject({
      name: createHotelDto.name,
      description: createHotelDto.description,
      price: createHotelDto.price,
      address: createHotelDto.address,
    });
  });

  it('/hotels (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/hotels')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data).toHaveLength(1);
  });

  it('/hotels/:id (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/hotels/${hotelId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: hotelId,
      name: 'test hotel',
    });
  });

  it('/hotels/:id (PATCH)', async () => {
    const updateHotelDto: UpdateHotelDTO = {
      name: 'updated hotel',
    };

    const response = await request(app.getHttpServer())
      .patch(`/hotels/${hotelId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateHotelDto)
      .expect(200);

    expect(response.body).toMatchObject({
      name: updateHotelDto.name,
    });
  });

  it('/hotels/image/:hotelId (PATCH)', async () => {
    await request(app.getHttpServer())
      .patch(`/hotels/image/${hotelId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('avatar', Buffer.from('mock-file-content'), 'mock-file.jpg')
      .expect(200);
  });

  it('/hotels/:id (DELETE)', async () => {
    await request(app.getHttpServer())
      .delete(`/hotels/${hotelId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});

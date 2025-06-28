import { Inject, Injectable } from '@nestjs/common'
import { HOTEL_REPOSITORIES_TOKEN } from '../utils/repositoriesHotel.Tokens'
import { IHotelRepositories } from '../domain/repositories/IHotel.repositories'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { Redis } from 'ioredis'
import { REDIS_HOTEL_KEY } from '../utils/redisKey'

@Injectable()
export class FindAllHotelsService {
  constructor(
    @Inject(HOTEL_REPOSITORIES_TOKEN)
    private readonly hotelRepositories: IHotelRepositories,
    @InjectRedis() private readonly redis: Redis
  ) { }
  async execute(page: number = 1, limit: number = 10) {
    const offSet = (page - 1) * limit
    const dataRedis = await this.redis.get(REDIS_HOTEL_KEY)
    let data = dataRedis ? JSON.parse(dataRedis) : null
    if (!data) {
      data = await this.hotelRepositories.findHotels(offSet, limit)
      await this.redis.set(REDIS_HOTEL_KEY, JSON.stringify(data))
    }

    const total = await this.hotelRepositories.countHotels()

    return {
      total,
      page,
      per_page: limit,
      data
    }
  }
}

import { Inject, Injectable } from '@nestjs/common'
import { UpdateHotelDTO } from '../domain/dto/updateHotel.dto'
import { IHotelRepositories } from '../domain/repositories/IHotel.repositories'
import { HOTEL_REPOSITORIES_TOKEN } from '../utils/repositoriesHotel.Tokens'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'
import { REDIS_HOTEL_KEY } from '../utils/redisKey'

@Injectable()
export class UpdateHotelsService {
  constructor(
    @Inject(HOTEL_REPOSITORIES_TOKEN)
    private readonly hotelRepositories: IHotelRepositories,
    @InjectRedis() private readonly redis: Redis
  ) { }
  async execute(id: number, updateHotelDto: UpdateHotelDTO) {
    await this.redis.del(REDIS_HOTEL_KEY)
    return await this.hotelRepositories.updateHotel(Number(id), updateHotelDto)
  }

}

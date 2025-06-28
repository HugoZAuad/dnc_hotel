import { Inject, Injectable } from "@nestjs/common"
import { RESERVATION_REPOSITORIES_TOKEN } from "../utils/repositoriesReservation.Tokens"
import { ReservationRepositories } from "../infra/reservations.repositories"
import { InjectRedis } from "@nestjs-modules/ioredis"
import Redis from "ioredis"
import { REDIS_RESERVATIONS_KEY } from "../utils/redisKey"

@Injectable()
export class FindAllReservationsService {
  constructor(
    @Inject(RESERVATION_REPOSITORIES_TOKEN)
    private readonly ReservationsRepositories: ReservationRepositories,
    @InjectRedis() private readonly redis: Redis
  ) { }

  async execute(page: number = 1, limit: number = 10) {
    const offSet = (page - 1) * limit
    const dataRedis = await this.redis.get(REDIS_RESERVATIONS_KEY)
    let data = dataRedis ? JSON.parse(dataRedis) : null
    if (!data) {
      data = await this.ReservationsRepositories.findAll(offSet, limit)
      await this.redis.set(REDIS_RESERVATIONS_KEY, JSON.stringify(data))
    }
    
    const total = await this.ReservationsRepositories.countReservations()

    return {
      total,
      page,
      per_page: limit,
      data
    }
  }
}
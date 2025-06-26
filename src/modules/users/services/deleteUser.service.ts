import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IUserRepositories } from '../domain/repositories/IUser.repositories'
import { USER_REPOSITORIES_TOKEN } from '../utils/repositoriesUser.Tokens'
import { isIdExists } from '../../prisma/utils/userUtils'
import { REDIS_USERS_KEY } from '../utils/redisKey'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'

@Injectable()
export class DeleteUserService {
  constructor(
    @Inject(USER_REPOSITORIES_TOKEN)
    private readonly userRepositories: IUserRepositories,
    @InjectRedis() private readonly redis: Redis
  ) {}

  async execute(id: number) {
    await this.redis.del(REDIS_USERS_KEY)
    await isIdExists(this.userRepositories, id)
    return this.userRepositories.delete(id)
  }
}

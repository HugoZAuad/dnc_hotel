import { Inject, Injectable } from '@nestjs/common'
import { updateUserDTO } from '../domain/dto/updateUser.dto'
import { IUserRepositories } from '../domain/repositories/IUser.repositories'
import { USER_REPOSITORIES_TOKEN } from '../utils/repositoriesUser.Tokens'
import { isIdExists, hashPassword } from '../../prisma/utils/userUtils'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'
import { REDIS_HOTEL_KEY } from 'src/modules/hotels/utils/redisKey'

@Injectable()
export class UpdateUserService {
  constructor(
    @Inject(USER_REPOSITORIES_TOKEN)
    private readonly userRepositories: IUserRepositories,
    @InjectRedis() private readonly redis: Redis
  ) {}

  async execute(id: number, updateUserDto: updateUserDTO) {
    await this.redis.del(REDIS_HOTEL_KEY)
    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password)
    }
    await isIdExists(this.userRepositories, id)
    
    return this.userRepositories.update(id, updateUserDto)
  }
}

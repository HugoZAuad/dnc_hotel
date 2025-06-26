import { Inject, Injectable, BadRequestException } from '@nestjs/common'
import { createUserDTO } from '../domain/dto/createUser.dto'
import { IUserRepositories } from '../domain/repositories/IUser.repositories'
import { USER_REPOSITORIES_TOKEN } from '../utils/repositoriesUser.Tokens'
import * as bcrypt from 'bcrypt'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'
import { REDIS_HOTEL_KEY } from 'src/modules/hotels/utils/redisKey'

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(USER_REPOSITORIES_TOKEN)
    private readonly userRepositories: IUserRepositories,
    @InjectRedis() private readonly redis: Redis
  ) {}

  async execute(createUserDto: createUserDTO) {
    await this.redis.del(REDIS_HOTEL_KEY)
    const userExists = await this.userRepositories.findByEmail(createUserDto.email)
    if (userExists) {
      throw new BadRequestException('Usuário já existe')
    }
    createUserDto.password = await this.hashPassword(createUserDto.password)
    return this.userRepositories.create(createUserDto)
  }

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, 10)
  }
}

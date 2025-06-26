import { Inject, Injectable } from '@nestjs/common'
import { IUserRepositories } from '../domain/repositories/IUser.repositories'
import { USER_REPOSITORIES_TOKEN } from '../utils/repositoriesUser.Tokens'
import { join, resolve } from 'path'
import { stat, unlink } from 'fs/promises'
import { isIdExists } from '../../prisma/utils/userUtils'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'
import { REDIS_USERS_KEY } from '../utils/redisKey'

@Injectable()
export class UploadAvatarUserService {
  constructor(
    @Inject(USER_REPOSITORIES_TOKEN)
    private readonly userRepositories: IUserRepositories,
    @InjectRedis() private readonly redis: Redis
  ) {}

  async execute(id: number, avatarFilename: string) {
    const user = await isIdExists(this.userRepositories, id)
    const directory = resolve(__dirname, '..', '..', '..', 'uploads')
    if (user.avatar) {
      const userAvatarFilePath = join(directory, user.avatar)
      const userAvatarFileExists = stat(userAvatarFilePath)
      if (userAvatarFileExists) {
        await unlink(userAvatarFilePath)
      }
    }
    await this.redis.del(REDIS_USERS_KEY)
    return this.userRepositories.update(id, { avatar: avatarFilename })
  }
}

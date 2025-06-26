import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IUserRepositories } from '../domain/repositories/IUser.repositories'
import { USER_REPOSITORIES_TOKEN } from '../utils/repositoriesUser.Tokens'
import { User } from 'generated/prisma/client'

@Injectable()
export class FindUserByEmailService {
  constructor(
    @Inject(USER_REPOSITORIES_TOKEN)
    private readonly userRepositories: IUserRepositories
  ) {}

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepositories.findByEmail(email)
    if (!user) {
      throw new NotFoundException('Usuário não existe')
    }
    return user
  }
}

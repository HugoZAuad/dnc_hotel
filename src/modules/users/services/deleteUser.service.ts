import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IUserRepositories } from '../domain/repositories/IUser.repositories'
import { USER_REPOSITORIES_TOKEN } from '../utils/repositoriesUser.Tokens'
import { isIdExists } from '../../prisma/utils/userUtils'

@Injectable()
export class DeleteUserService {
  constructor(
    @Inject(USER_REPOSITORIES_TOKEN)
    private readonly userRepositories: IUserRepositories
  ) {}

  async execute(id: number) {
    await isIdExists(this.userRepositories, id)
    return this.userRepositories.delete(id)
  }
}

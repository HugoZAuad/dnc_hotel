import { Inject, Injectable } from '@nestjs/common'
import { updateUserDTO } from '../domain/dto/updateUser.dto'
import { IUserRepositories } from '../domain/repositories/IUser.repositories'
import { USER_REPOSITORIES_TOKEN } from '../utils/repositoriesUser.Tokens'
import { isIdExists, hashPassword } from '../../prisma/utils/userUtils'

@Injectable()
export class UpdateUserService {
  constructor(
    @Inject(USER_REPOSITORIES_TOKEN)
    private readonly userRepositories: IUserRepositories
  ) {}

  async execute(id: number, updateUserDto: updateUserDTO) {
    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password)
    }
    await isIdExists(this.userRepositories, id)
    return this.userRepositories.update(id, updateUserDto)
  }
}

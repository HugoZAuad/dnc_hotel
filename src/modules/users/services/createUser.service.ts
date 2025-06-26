import { Inject, Injectable, BadRequestException } from '@nestjs/common'
import { createUserDTO } from '../domain/dto/createUser.dto'
import { IUserRepositories } from '../domain/repositories/IUser.repositories'
import { USER_REPOSITORIES_TOKEN } from '../utils/repositoriesUser.Tokens'
import * as bcrypt from 'bcrypt'

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(USER_REPOSITORIES_TOKEN)
    private readonly userRepositories: IUserRepositories
  ) {}

  async execute(createUserDto: createUserDTO) {
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

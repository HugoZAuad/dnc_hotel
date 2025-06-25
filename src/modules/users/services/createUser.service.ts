import { BadRequestException, Inject, Injectable } from "@nestjs/common"

import { User } from "generated/prisma/client"
import { createUserDTO } from "../domain/dto/createUser.dto"
import { hashPassword } from "../utils/hashPassword.utils"
import { userSelectFields } from "../../prisma/utils/userSelectFields"
import { USER_REPOSITORIES_TOKEN } from "../utils/repositoriesUsers.Tokens"
import { IUserRepositories } from "../domain/repositories/IUser.repositories"

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(USER_REPOSITORIES_TOKEN)
    private readonly userRepositories: IUserRepositories) { }

  async create(body: createUserDTO): Promise<User> {
    const user = await this.userRepositories.findUserByEmail(body.email)
    if (user) {
      throw new BadRequestException('Usuario já existe')
    }

    body.password = await hashPassword(body.password)
    return await this.userRepositories.createUser(body)
  }
}

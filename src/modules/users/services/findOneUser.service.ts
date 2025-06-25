import { Injectable, Inject } from "@nestjs/common"
import { IsIdExistsUtil } from "../utils/isIdExists.utils"
import { USER_REPOSITORIES_TOKEN } from "../utils/repositoriesUsers.Tokens"
import { IUserRepositories } from "../domain/repositories/IUser.repositories"

@Injectable()
export class FindOneUserService {
  constructor(
    @Inject(USER_REPOSITORIES_TOKEN)
    private readonly userRepositories: IUserRepositories,
    private readonly isIdExistsUtil: IsIdExistsUtil
  ) {}

  async show(id: number) {
    return await this.isIdExistsUtil.isIdExists(id)
  }

  async findByEmail(email: string) {
    return await this.userRepositories.findUserByEmail(email)
  }
}

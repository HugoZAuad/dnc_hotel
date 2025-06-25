import { Injectable, Inject } from "@nestjs/common"
import { IsIdExistsUtil } from "../utils/isIdExists.utils"
import { USER_REPOSITORIES_TOKEN } from "../utils/repositoriesUsers.Tokens"
import { IUserRepositories } from "../domain/repositories/IUser.repositories"

@Injectable()
export class DeleteUserService {
  constructor(
    @Inject(USER_REPOSITORIES_TOKEN)
    private readonly userRepositories: IUserRepositories,
    private readonly isIdExistsUtil: IsIdExistsUtil
  ) {}

  async delete(id: number) {
    await this.isIdExistsUtil.isIdExists(id)
    return this.userRepositories.deleteUser(id)
  }
}

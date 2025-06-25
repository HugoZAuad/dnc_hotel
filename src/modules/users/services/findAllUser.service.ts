import { Injectable, Inject } from "@nestjs/common"
import { USER_REPOSITORIES_TOKEN } from "../utils/repositoriesUsers.Tokens"
import { IUserRepositories } from "../domain/repositories/IUser.repositories"

@Injectable()
export class FindAllUserService {
  constructor(
    @Inject(USER_REPOSITORIES_TOKEN)
    private readonly userRepositories: IUserRepositories
  ) {}

  async list() {
    return await this.userRepositories.findUsers()
  }
}

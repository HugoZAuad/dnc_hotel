import { Injectable, Inject } from "@nestjs/common"
import { join, resolve } from "path"
import { stat, unlink } from "fs/promises"
import { IsIdExistsUtil } from "../utils/isIdExists.utils"
import { updateUserDTO } from "../domain/dto/updateUser.dto"
import { USER_REPOSITORIES_TOKEN } from "../utils/repositoriesUsers.Tokens"
import { IUserRepositories } from "../domain/repositories/IUser.repositories"

@Injectable()
export class UploadAvatarService {
  constructor(
    private readonly isIdExistsUtil: IsIdExistsUtil,
    @Inject(USER_REPOSITORIES_TOKEN)
    private readonly userRepositories: IUserRepositories
  ) {}

  async uploadAvatar(id: number, avatarFilename: string) {
    const user = await this.isIdExistsUtil.isIdExists(id)
    const directory = resolve(__dirname, '..', '..', '..', 'uploads')
    if (user.avatar) {
      const userAvatarFilePath = join(directory, user.avatar)
      const userAvatarFileExists = await stat(userAvatarFilePath).catch(() => false)
      if (userAvatarFileExists) {
        await unlink(userAvatarFilePath)
      }
    }
    const userUpdated = await this.userRepositories.uploadAvatar(id, { avatar: avatarFilename })
    return userUpdated
  }
}

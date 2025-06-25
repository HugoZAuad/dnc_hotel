import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import { join, resolve } from "path"
import { stat, unlink } from "fs/promises"
import { IsIdExistsUtil } from "../utils/isIdExists.utils"
import { updateUserDTO } from "../domain/dto/updateUser.dto"
import { UpdateUserService } from "./updateUser.service"

@Injectable()
export class UploadAvatarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly isIdExistsUtil: IsIdExistsUtil,
    private readonly updateUserService: UpdateUserService
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
    const userUpdated = await this.updateUserService.update(id, { avatar: avatarFilename } as updateUserDTO)
    return userUpdated
  }
}

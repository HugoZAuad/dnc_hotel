import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import { updateUserDTO } from "../domain/dto/updateUser.dto"
import { userSelectFields } from "../../prisma/utils/userSelectFields"
import { hashPassword } from "../utils/hashPassword.utils"
import { IsIdExistsUtil } from "../utils/isIdExists.utils"

@Injectable()
export class UpdateUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly isIdExistsUtil: IsIdExistsUtil
  ) {}

  async update(id: number, body: updateUserDTO) {
    if (body.password) {
      body.password = await hashPassword(body.password)
    }

    await this.isIdExistsUtil.isIdExists(id)
    return this.prisma.user.update({ where: { id }, data: body, select: userSelectFields })
  }
}

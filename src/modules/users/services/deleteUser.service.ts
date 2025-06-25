import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import { userSelectFields } from "../../prisma/utils/userSelectFields"
import { IsIdExistsUtil } from "../utils/isIdExists.utils"

@Injectable()
export class DeleteUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly isIdExistsUtil: IsIdExistsUtil
  ) {}

  async delete(id: number) {
    await this.isIdExistsUtil.isIdExists(id)
    return this.prisma.user.delete({ where: { id }, select: userSelectFields })
  }
}

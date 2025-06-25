import { NotFoundException } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import { userSelectFields } from "../../prisma/utils/userSelectFields"

export class IsIdExistsUtil {
  constructor(private readonly prisma: PrismaService) {}

  async isIdExists(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: userSelectFields })
    if (!user) {
      throw new NotFoundException('Usuario não existe')
    }
    return user
  }
}

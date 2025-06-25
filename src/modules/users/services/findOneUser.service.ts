import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import { IsIdExistsUtil } from "../utils/isIdExists.utils"

@Injectable()
export class FindOneUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly isIdExistsUtil: IsIdExistsUtil
  ) {}

  async show(id: number) {
    return await this.isIdExistsUtil.isIdExists(id)
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } })
  }
}

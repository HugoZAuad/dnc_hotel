import { BadRequestException, Injectable } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import { User } from "generated/prisma/client"
import { createUserDTO } from "../domain/dto/createUser.dto"
import { hashPassword } from "../utils/hashPassword.utils"
import { userSelectFields } from "../../prisma/utils/userSelectFields"

@Injectable()
export class CreateUserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: createUserDTO): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email: body.email } })
    if (user) {
      throw new BadRequestException('Usuario já existe')
    }

    body.password = await hashPassword(body.password)
    return await this.prisma.user.create({
      data: body,
      select: userSelectFields
    })
  }
}

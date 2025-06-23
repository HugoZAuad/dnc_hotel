import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { User } from "generated/prisma/client"
import { createUserDTO } from "./domain/dto/CreateUser.dto"
import { updateUserDTO } from "./domain/dto/updateUser.dto"

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async list() {
    return await this.prisma.user.findMany()
  }
  
  async show(id: number) {
    const user = await this.isIdExists(id)
    return user
  }

  async create(body: createUserDTO): Promise<User> {
    return await this.prisma.user.create({ data: body })
  }
  
  async update(id: number, body: updateUserDTO) {
    await this.isIdExists(id)
    return this.prisma.user.update({ where: { id }, data: body })
  }

  async delete(id: number) {
    await this.isIdExists(id)
    return this.prisma.user.delete({ where: { id }})
  }

  private async isIdExists(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new NotFoundException('Usuario não existe')
    }
    return user
  }
}
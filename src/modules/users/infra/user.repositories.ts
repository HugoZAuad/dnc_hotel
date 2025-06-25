import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import { User } from "generated/prisma/client"
import { createUserDTO } from "../domain/dto/createUser.dto"
import { IHotelRepositories as IUserRepositories } from "../domain/repositories/IUser.repositories"

@Injectable()
export class UserRepositories implements IUserRepositories {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: createUserDTO): Promise<User> {
    return await this.prisma.user.create({ data })
  }

  async findUserById(id: number): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { id } })
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { email } })
  }

  async findUsers(): Promise<User[]> {
    return await this.prisma.user.findMany()
  }

  async updateUser(id: number, data: createUserDTO): Promise<User> {
    return await this.prisma.user.update({ where: { id }, data })
  }

  async deleteUser(id: number): Promise<User> {
    return await this.prisma.user.delete({ where: { id } })
  }
}

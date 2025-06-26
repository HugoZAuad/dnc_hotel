import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { IUserRepositories } from '../domain/repositories/IUser.repositories'
import { createUserDTO } from '../domain/dto/createUser.dto'
import { updateUserDTO } from '../domain/dto/updateUser.dto'
import { User } from 'generated/prisma/client'

@Injectable()
export class UserRepositories implements IUserRepositories {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany()
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async create(data: createUserDTO): Promise<User> {
    return this.prisma.user.create({ data })
  }

  async update(id: number, data: updateUserDTO): Promise<User> {
    return this.prisma.user.update({ where: { id }, data })
  }

  async delete(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } })
  }
}

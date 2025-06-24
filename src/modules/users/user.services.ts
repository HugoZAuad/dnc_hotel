
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { $Enums, User } from "generated/prisma/client"
import { createUserDTO } from "./domain/dto/CreateUser.dto"
import { updateUserDTO } from "./domain/dto/updateUser.dto"
import * as bcrypt from "bcrypt"
import { userSelectFields } from "../prisma/utils/userSelectFields"
import { join, resolve } from "path"
import { stat, unlink } from "fs/promises"

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async list() {
    return await this.prisma.user.findMany({ select: userSelectFields })
  }
  async show(id: number) {
    const user = await this.isIdExists(id)
    return user
  }

  async create(body: createUserDTO): Promise<User> {
    const user = await this.findByEmail(body.email)
    if (user) {
      throw new BadRequestException('Usuario já existe')
    }

    body.password = await this.hashPassword(body.password)
    return await this.prisma.user.create({
      data: body,
      select: userSelectFields
    })
  }

  async update(id: number, body: updateUserDTO) {
    if (body.password) {
      body.password = await this.hashPassword(body.password)
    }

    await this.isIdExists(id)
    return this.prisma.user.update({ where: { id }, data: body, select: userSelectFields })
  }
  async delete(id: number) {
    await this.isIdExists(id)
    return this.prisma.user.delete({ where: { id }, select: userSelectFields })
  }

  async uploadAvatar(id: number, avatarFilename: string) {
    const user = await this.isIdExists(id)
    const directory = resolve(__dirname, '..', '..', '..', 'uploads')
    if (user.avatar) {
      const userAvatarFilePath = join(directory, user.avatar)
      const userAvatarFileExists = stat(userAvatarFilePath)
      if (userAvatarFileExists) {
        await unlink(userAvatarFilePath)
      }
    }
    const userUpdated = await this.update(id, { avatar: avatarFilename })
    return userUpdated
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    })
  }

  private async isIdExists(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: userSelectFields })
    if (!user) {
      throw new NotFoundException('Usuario não existe')
    }

    return user
  }

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, 10)
  }
}
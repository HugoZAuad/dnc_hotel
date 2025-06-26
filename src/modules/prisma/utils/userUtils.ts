import { IUserRepositories } from '../../users/domain/repositories/IUser.repositories'
import { NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

export async function isIdExists(userRepositories: IUserRepositories, id: number) {
  const user = await userRepositories.findById(id)
  if (!user) {
    throw new NotFoundException('Usuário não existe')
  }
  return user
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10)
}

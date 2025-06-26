import { userSelectFields } from './../../../prisma/utils/userSelectFields';
import { createUserDTO } from '../dto/createUser.dto'
import { updateUserDTO } from '../dto/updateUser.dto'
import { User } from 'generated/prisma/client'

export interface IUserRepositories {
  findAll(offSet: number, limit: number, select: object): Promise<User[]>
  findById(id: number): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: createUserDTO): Promise<User>
  update(id: number, data: updateUserDTO): Promise<User>
  delete(id: number): Promise<User>
}

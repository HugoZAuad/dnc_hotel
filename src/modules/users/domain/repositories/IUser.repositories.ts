import { User } from "generated/prisma/client"
import { createUserDTO } from "../dto/CreateUser.dto"
import { updateUserDTO } from "../dto/updateUser.dto"


export interface IUserRepositories{
  createUser(data: createUserDTO): Promise<User>
  findUserById(id: number): Promise<User | null>
  findUserByEmail(name: string): Promise<User | null>
  findUsers(): Promise<User[]>
  updateUser(id: number, data: createUserDTO): Promise<User>
  deleteUser(id: number): Promise<User>
  uploadAvatar(id: number, data: updateUserDTO): Promise<User>
}

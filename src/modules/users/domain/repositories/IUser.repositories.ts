import { User } from "generated/prisma/client"
import { createUserDTO } from "../dto/CreateUser.dto"


export interface IHotelRepositories{
  createUser(data: createUserDTO): Promise<User>
  findUserById(id: number): Promise<User | null>
  findUserByEmail(name: string): Promise<User | null>
  findUsers(): Promise<User[]>
  updateUser(id: number, data: createUserDTO): Promise<User>
  deleteUser(id: number): Promise<User>
}
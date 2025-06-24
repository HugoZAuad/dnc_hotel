import { UserService } from './../users/user.services';
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { User } from "generated/prisma/client"
import { AuthLoginDTO } from "./domain/dto/authLogin.dto"
import { PrismaService } from "../prisma/prisma.service"
import * as bcrypt from "bcrypt"
import { createUserDTO } from '../users/domain/dto/CreateUser.dto'
import { AuthRegisterDTO } from './domain/dto/authRegister.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService:UserService
  ) { }

  async generateJwtToken(user: User) {
    const payload = { sub: user.id, name: user.name }
    const options = { expiresIn: '1d', issuer: 'dnc_hotel', audience: 'users' }
    return { access_token: await this.jwtService.signAsync(payload, options) }
  }

  async login({ email, password }: AuthLoginDTO) {
    const user = await this.userService.findByEmail(email)
    if(!user || await bcrypt.compare(password, user.password)){
      throw new UnauthorizedException('E-mail ou password esta incorreto')
    }
    return await this.generateJwtToken(user)
  }

  async register(body: AuthRegisterDTO){
    const newUser: createUserDTO = {
      email: body.email,
      name: body.name,
      password: body.password,
      role: body.role ?? 'USER'
    }
    const user = await this.userService.create(newUser)
    return await this.generateJwtToken(user)
  }
}
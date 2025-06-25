import { CreateUserService } from 'src/modules/users/services/createUser.service'
import { FindOneUserService } from 'src/modules/users/services/findOneUser.service'
import { UpdateUserService } from 'src/modules/users/services/updateUser.service'
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { User } from "generated/prisma/client"
import { AuthLoginDTO } from "./domain/dto/authLogin.dto"
import * as bcrypt from "bcrypt"
import { createUserDTO } from '../users/domain/dto/CreateUser.dto'
import { AuthRegisterDTO } from './domain/dto/authRegister.dto'
import { AuthResetPasswordDTO } from './domain/dto/authResetPassword.dto'
import { ValidateTokenDTO } from './domain/dto/validateToken.dto'
import { MailerService } from '@nestjs-modules/mailer'
import { templateHTML } from './domain/utils/templateHtml'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly createUserService: CreateUserService,
    private readonly findOneUserService: FindOneUserService,
    private readonly updateUserService: UpdateUserService,
    private readonly mailerService: MailerService
  ) { }

  async generateJwtToken(user: User, expiresIn: string = '1d') {
    const payload = { sub: user.id, name: user.name }
    const options = { expiresIn: expiresIn, issuer: 'dnc_hotel', audience: 'users' }
    return { access_token: await this.jwtService.signAsync(payload, options) }
  }

  async login({ email, password }: AuthLoginDTO) {
    // Using findOneUserService to find user by email
    const users = await this.findOneUserService.findByEmail(email)
    const user = users ? users : null
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('E-mail ou password esta incorreto')
    }

    return await this.generateJwtToken(user)
  }

  async register(body: AuthRegisterDTO) {
    const newUser: createUserDTO = {
      email: body.email,
      name: body.name,
      password: body.password,
      role: body.role ?? 'USER'
    }
    const user = await this.createUserService.create(newUser)
    return await this.generateJwtToken(user)
  }

  async reset({ token, password }: AuthResetPasswordDTO) {
    const { valid, decoded } = await this.validateToken(token)
    if (!valid || !decoded) throw new UnauthorizedException('Token invalido')

    const user: User = await this.updateUserService.update(Number(decoded.sub), { password })
    return await this.generateJwtToken(user)
  }

  async forgot(email: string) {
    // Using findOneUserService to find user by email
    const users = await this.findOneUserService.findByEmail(email)
    const user = users ? users : null
    if (!user) throw new UnauthorizedException('E-mail esta incorreto')

    const token = await this.generateJwtToken(user, '30m')

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Password - DNC Hotel',
      html: templateHTML(user.name, token.access_token),
    })

    return `O codigo de verificação foi enviado para o seu ${email}`
  }

  async validateToken(token: string): Promise<ValidateTokenDTO> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
        issuer: 'dnc_hotel',
        audience: 'users',
      })
      return { valid: true, decoded }

    } catch (error) {
      return { valid: false, message: error.message }
    }
  }
}

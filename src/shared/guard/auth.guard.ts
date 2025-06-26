import { FindUserByIdService } from 'src/modules/users/services/findUserById.service'
import { AuthService } from './../../modules/auth/auth.service'
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly findUserByIdService: FindUserByIdService
  ) { }

  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest()
      const { authorization } = request.headers
      if (!authorization || !authorization.startsWith('Bearer ')) throw new UnauthorizedException('Token inválido')

      const token = authorization.split(' ')[1]
      const { valid, decoded } = await this.authService.validateToken(token)
      if (!valid) throw new UnauthorizedException('Token inválido')

      const user = await this.findUserByIdService.show(Number(decoded.sub))
      if (!user) throw new UnauthorizedException('Usuário não encontrado')

      request.user = user

      return true
    } catch (error) {
      throw new UnauthorizedException('Não autorizado')
    }
  }
}

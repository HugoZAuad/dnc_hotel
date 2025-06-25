import { FindOneUserService } from 'src/modules/users/services/findOneUser.service'
import { AuthService } from './../../modules/auth/auth.service'
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly findOneUserService: FindOneUserService
  ) { }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    const { authorization } = request.headers
    if (!authorization || !authorization.startsWith('Bearer ')) throw new UnauthorizedException('Token invalido')

    const token = authorization.split(' ')[1]
    const { valid, decoded } = await this.authService.validateToken(token)
    if (!valid) throw new UnauthorizedException('Token invalido')

    const user = await this.findOneUserService.show(Number(decoded.sub))
    if (!user) return false

    request.user = user

    return true
  }
}

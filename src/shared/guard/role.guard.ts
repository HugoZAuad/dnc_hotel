import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { ROLES_KEY } from "../decorators/roles.decorator"
import { Role } from "generated/prisma/client"

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext) {
    const requeridRules = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), 
      context.getClass(),
    ])
    if(!requeridRules) return true

    const {user} = context.switchToHttp().getRequest()
    if(!user) return false

    const isRoleMatch = requeridRules.some((role) => user.role === role)

    return isRoleMatch
  }
}
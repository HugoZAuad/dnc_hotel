import { createParamDecorator, ExecutionContext, NotFoundException } from "@nestjs/common"

export const User = createParamDecorator((filter: string, context: ExecutionContext) => {
  const User = context.switchToHttp().getRequest().user
  if (!User) throw new NotFoundException("Usuario não encontrado")

  if (filter) {
    if (!User[filter]) {
      throw new NotFoundException(`Usuario ${filter} não encontrado`)
    }
    return User[filter]
  }
  return User
})
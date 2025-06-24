import { AuthGuard } from 'src/shared/guard/auth.guard'
import { ParamId } from '../../shared/decorators/ParamId.decorator'
import { createUserDTO } from './domain/dto/CreateUser.dto'
import { updateUserDTO } from './domain/dto/updateUser.dto'
import { UserService } from './user.services'
import { Body, Controller, Delete, Get, Patch, Post, UseGuards } from "@nestjs/common"
import { User } from 'src/shared/decorators/user.decorator'
import { User as UserType } from "generated/prisma/client"

@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) { }


  @Get()
  list(@User() user: UserType) {
    console.log(user)
    return this.userService.list()
  }

  @Get(':id')
  show(@ParamId() id: number) {
    return this.userService.show(id)
  }

  @Post()
  createUser(@Body() body: createUserDTO) {
    return this.userService.create(body)
  }

  @Patch(':id')
  updateUser(@ParamId() id: number, @Body() body: updateUserDTO) {
    return this.userService.update(id, body)
  }

  @Delete(':id')
  deleteUser(@ParamId() id: number) {
    return this.userService.delete(id)
  }

}
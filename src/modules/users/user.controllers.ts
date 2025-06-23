import { ParamId } from '../shared/decorators/ParamId.decorator'
import { createUserDTO } from './domain/dto/CreateUser.dto'
import { updateUserDTO } from './domain/dto/updateUser.dto'
import { UserService } from './user.services'
import { Body, Controller, Delete, Get, Patch, Post } from "@nestjs/common"

@Controller('users')
export class UserController {
  constructor(private userService: UserService) { }

  @Get()
  list() {
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
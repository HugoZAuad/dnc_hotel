import { createUserDTO } from './domain/dto/CreateUser.dto'
import { updateUserDTO } from './domain/dto/updateUser.dto'
import { UserService } from './user.services'
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from "@nestjs/common"

@Controller('users')
export class UserController {
  constructor(private userService: UserService) { }

  @Get()
  list() {
    return this.userService.list()
  }

  @Get(':id')
  show(@Param('id', ParseIntPipe) id: number) {
    return this.userService.show(id)
  }

  @Post()
  createUser(@Body() body: createUserDTO) {
    return this.userService.create(body)
  }

  @Patch(':id')
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() body: updateUserDTO) {
    return this.userService.update(id, body)
  }

  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id)
  }

}
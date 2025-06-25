import { RoleGuard } from '../../../shared/guard/role.guard'
import { AuthGuard } from 'src/shared/guard/auth.guard'
import { ParamId } from '../../../shared/decorators/ParamId.decorator'
import { createUserDTO } from '../domain/dto/createUser.dto'
import { updateUserDTO } from '../domain/dto/updateUser.dto'
import { CreateUserService } from '../services/createUser.service'
import { UpdateUserService } from '../services/updateUser.service'
import { DeleteUserService } from '../services/deleteUser.service'
import { FindAllUserService } from '../services/findAllUser.service'
import { FindOneUserService } from '../services/findOneUser.service'
import { UploadAvatarService } from '../services/uploadAvatar.service'
import { Body, Controller, Delete, Get, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common"
import { User } from 'src/shared/decorators/user.decorator'
import { Role, User as UserType } from "generated/prisma/client"
import { Roles } from 'src/shared/decorators/roles.decorator'
import { UserMatchGuard } from 'src/shared/guard/userMatch.guard'
import { ThrottlerGuard } from '@nestjs/throttler'
import { FileInterceptor } from '@nestjs/platform-express'
import { FileValidationInterceptor } from 'src/shared/interceptors/fileValidation.interceptor'
import { FileTypeinterceptor } from 'src/shared/interceptors/fileType.interceptor'

@UseGuards(AuthGuard, RoleGuard, ThrottlerGuard)
@Controller('users')
export class UserController {
  constructor(
    private createUserService: CreateUserService,
    private updateUserService: UpdateUserService,
    private deleteUserService: DeleteUserService,
    private findAllUserService: FindAllUserService,
    private findOneUserService: FindOneUserService,
    private uploadAvatarService: UploadAvatarService
  ) { }

  @Get()
  list(@User() user: UserType) {
    console.log(user)
    return this.findAllUserService.list()
  }

  @Get(':id')
  show(@ParamId() id: number) {
    return this.findOneUserService.show(id)
  }

  @Roles(Role.ADMIN)
  @Post()
  createUser(@Body() body: createUserDTO) {
    return this.createUserService.create(body)
  }

  @UseGuards(UserMatchGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Patch(':id')
  updateUser(@ParamId() id: number, @Body() body: updateUserDTO) {
    return this.updateUserService.update(id, body)
  }

  @UseGuards(UserMatchGuard)
  @Delete(':id')
  deleteUser(@ParamId() id: number) {
    return this.deleteUserService.delete(id)
  }

  @UseInterceptors(FileInterceptor('avatar'), FileValidationInterceptor)
  @Post('avatar')
  uploadAvatar(
    @User('id') id: number,
    @UploadedFile(FileTypeinterceptor)
    avatar: Express.Multer.File
  ) {
    return this.uploadAvatarService.uploadAvatar(id, avatar.filename)
  }

}
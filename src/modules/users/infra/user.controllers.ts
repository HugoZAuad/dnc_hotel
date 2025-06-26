import { RoleGuard } from '../../../shared/guard/role.guard'
import { AuthGuard } from 'src/shared/guard/auth.guard'
import { ParamId } from '../../../shared/decorators/ParamId.decorator'
import { createUserDTO } from '../domain/dto/CreateUser.dto'
import { updateUserDTO } from '../domain/dto/updateUser.dto'
import { Body, Controller, Delete, Get, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common"
import { User } from 'src/shared/decorators/user.decorator'
import { Role, User as UserType } from "generated/prisma/client"
import { Roles } from 'src/shared/decorators/roles.decorator'
import { UserMatchGuard } from 'src/shared/guard/userMatch.guard'
import { ThrottlerGuard } from '@nestjs/throttler'
import { FileInterceptor } from '@nestjs/platform-express'
import { FileValidationInterceptor } from 'src/shared/interceptors/fileValidation.interceptor'
import { FileTypeinterceptor } from 'src/shared/interceptors/fileType.interceptor'
import { CreateUserService } from '../services/createUser.service'
import { DeleteUserService } from '../services/deleteUser.service'
import { FindUserByIdService } from '../services/findUserById.service'
import { UpdateUserService } from '../services/updateUser.service'
import { UploadAvatarUserService } from '../services/uploadAvatarUser.service'
import { FindAllUserService } from '../services/findAllUser.service'

@UseGuards(AuthGuard, RoleGuard, ThrottlerGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly deleteUserService: DeleteUserService,
    private readonly findUserByIdService: FindUserByIdService,
    private readonly findAllUsersService: FindAllUserService,
    private readonly updateUserService: UpdateUserService,
    private readonly uploadAvatarUserService: UploadAvatarUserService,
    
  ) { }

  @Get()
  list(@User() user: UserType) {
    return this.findAllUsersService.execute()
  }

  @Get(':id')
  show(@ParamId() id: number) {
    return this.findUserByIdService.show(id)
  }
  
  @Roles(Role.ADMIN)
  @Post()
  createUser(@Body() body: createUserDTO) {
    return this.createUserService.execute(body)
  }

  @UseGuards(UserMatchGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Patch(':id')
  updateUser(@ParamId() id: number, @Body() body: updateUserDTO) {
    return this.updateUserService.execute(id, body)
  }

  @UseGuards(UserMatchGuard)
  @Delete(':id')
  deleteUser(@ParamId() id: number) {
    return this.deleteUserService.execute(id)
  }

  @UseInterceptors(FileInterceptor('avatar'), FileValidationInterceptor)
  @Post('avatar')
  uploadAvatar(
    @User('id') id: number,
    @UploadedFile(FileTypeinterceptor)
    avatar: Express.Multer.File
  ) {
    return this.uploadAvatarUserService.execute(id, avatar.filename)
  }

}
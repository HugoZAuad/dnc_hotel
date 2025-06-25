import { forwardRef, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common"
import { UserController } from "./infra/users.controller"
import { CreateUserService } from "./services/createUser.service"
import { UpdateUserService } from "./services/updateUser.service"
import { DeleteUserService } from "./services/deleteUser.service"
import { FindAllUserService } from "./services/findAllUser.service"
import { FindOneUserService } from "./services/findOneUser.service"
import { UploadAvatarService } from "./services/uploadAvatar.service"
import { IsIdExistsUtil } from "./utils/isIdExists.utils"
import { PrismaModule } from "../prisma/prisma.module"
import { AuthModule } from "../auth/auth.module"
import { UserIdCheckMiddleware } from "src/shared/middlewares/userIdCheck.middleware"
import { MulterModule } from "@nestjs/platform-express"
import { diskStorage } from "multer"
import { v4 as uuidv4 } from 'uuid'
import { USER_REPOSITORIES_TOKEN } from "./utils/repositoriesUsers.Tokens"
import { UserRepositories } from "./infra/user.repositories"

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${uuidv4()}${file.originalname}`
          return cb(null, filename)
        }
      })
    })],
  controllers: [UserController],
  providers: [
    CreateUserService,
    UpdateUserService,
    DeleteUserService,
    FindAllUserService,
    FindOneUserService,
    UploadAvatarService,
    IsIdExistsUtil,
    {
          provide: USER_REPOSITORIES_TOKEN,
          useClass: UserRepositories
        }],
  exports: [
    CreateUserService,
    UpdateUserService,
    DeleteUserService,
    FindAllUserService,
    FindOneUserService,
    UploadAvatarService
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdCheckMiddleware)
      .forRoutes(
        { path: 'users/:id', method: RequestMethod.GET },
        { path: 'users/:id', method: RequestMethod.PATCH },
        { path: 'users/:id', method: RequestMethod.DELETE },
      )
  }
}

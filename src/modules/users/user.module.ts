import { forwardRef, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common"
import { UserController } from "./infra/user.controllers"
import { CreateUserService } from "./services/createUser.service"
import { UpdateUserService } from "./services/updateUser.service"
import { DeleteUserService } from "./services/deleteUser.service"
import { UploadAvatarUserService } from "./services/uploadAvatarUser.service"
import { UserRepositories } from "./infra/user.repositories"
import { USER_REPOSITORIES_TOKEN } from "./utils/repositoriesUser.Tokens"
import { PrismaModule } from "../prisma/prisma.module"
import { AuthModule } from "../auth/auth.module"
import { UserIdCheckMiddleware } from "src/shared/middlewares/userIdCheck.middleware"
import { MulterModule } from "@nestjs/platform-express"
import { diskStorage } from "multer"
import { v4 as uuidv4 } from 'uuid'
import { FindAllUserService } from "./services/findAllUser.service"
import { FindUserByEmailService } from "./services/findUserByEmail.service"
import { FindUserByIdService } from "./services/findUserById.service"

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
    FindUserByEmailService,
    FindUserByIdService,
    UploadAvatarUserService,
    {
      provide: USER_REPOSITORIES_TOKEN,
      useClass: UserRepositories
    }
  ],
  exports: [
    CreateUserService,
    UpdateUserService,
    DeleteUserService,
    UploadAvatarUserService,
    FindUserByEmailService,
    FindUserByIdService
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

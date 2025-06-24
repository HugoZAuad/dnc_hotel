import { Module } from '@nestjs/common'
import { PrismaModule } from './modules/prisma/prisma.module'
import { UserModule } from './modules/users/user.module'
import { authModule } from './modules/auth/auth.module'

@Module({
  imports: [PrismaModule, UserModule, authModule],
})
export class AppModule { }

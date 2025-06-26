import { Module } from '@nestjs/common'
import { ReservationsController } from './infra/reservations.controller'
import { CreateReservationsService } from './services/createReservations.service'
import { PrismaModule } from '../prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'
import { UserModule } from '../users/user.module'
import { HotelsModule } from '../hotels/hotels.module'
import { ReservationRepositories } from './infra/reservations.repositories'
import { RESERVATION_REPOSITORIES_TOKEN } from './utils/repositoriesReservation.Tokens'


@Module({
  imports: [PrismaModule, AuthModule, UserModule, HotelsModule],
  controllers: [ReservationsController],
  providers: [CreateReservationsService, {
    provide: RESERVATION_REPOSITORIES_TOKEN,
    useClass: ReservationRepositories
  }],
})
export class ReservationsModule { }

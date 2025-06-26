import { Module } from '@nestjs/common'
import { ReservationsController } from './infra/reservations.controller'
import { CreateReservationsService } from './services/createReservations.service'
import { PrismaModule } from '../prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'
import { UserModule } from '../users/user.module'
import { HotelsModule } from '../hotels/hotels.module'
import { ReservationRepositories } from './infra/reservations.repositories'
import { RESERVATION_REPOSITORIES_TOKEN } from './utils/repositoriesReservation.Tokens'
import { HOTEL_REPOSITORIES_TOKEN } from '../hotels/utils/repositoriesHotel.Tokens'
import { HotelRepositories } from '../hotels/infra/hotels.repository'
import { FindByIdReservationsService } from './services/findByIdReservations.service'
import { FindAllReservationsService } from './services/findAllReservations.service'
import { FindByUserReservationsService } from './services/findByUserReservations.service'
import { UpdateStatusReservationService } from './services/updateStatusReservations.service'


@Module({
  imports: [PrismaModule, AuthModule, UserModule, HotelsModule],
  controllers: [ReservationsController],
  providers: [
    CreateReservationsService,
    FindByIdReservationsService,
    FindAllReservationsService,
    FindByUserReservationsService,
    UpdateStatusReservationService,
    {
      provide: RESERVATION_REPOSITORIES_TOKEN,
      useClass: ReservationRepositories
    },
    {
      provide: HOTEL_REPOSITORIES_TOKEN,
      useClass: HotelRepositories
    },
  ],
})
export class ReservationsModule { }

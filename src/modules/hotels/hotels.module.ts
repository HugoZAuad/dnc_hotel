import { Module } from '@nestjs/common'
import { HotelsController } from './infra/hotels.controller'
import { CreateHotelsService } from './services/createHotel.service'
import { FindAllHotelsService } from './services/findAllHotel.service'
import { FindOneHotelsService } from './services/findOneHotel.service'
import { DeleteHotelsService } from './services/deleteHotel.service'
import { UpdateHotelsService } from './services/updateHotel.service'
import { HotelRepositories } from './infra/hotel.repository'
import { PrismaModule } from '../prisma/prisma.module'
import { HOTEL_REPOSITORIES_TOKEN } from './utils/repositoriesHotel.Tokens'
import { FindByNameHotelService } from './services/findByNameHotel.service'
import { FindByOwnerHotelService } from './services/findByOwnerHotel.service'
import { AuthModule } from '../auth/auth.module'
import { UserModule } from '../users/user.module'

@Module({
  imports: [PrismaModule, AuthModule, UserModule],
  controllers: [HotelsController],
  providers: [
    CreateHotelsService,
    FindAllHotelsService,
    FindOneHotelsService,
    DeleteHotelsService,
    UpdateHotelsService,
    FindByNameHotelService,
    FindByOwnerHotelService,
    {
      provide: HOTEL_REPOSITORIES_TOKEN,
      useClass: HotelRepositories
    }],
})
export class HotelsModule { }

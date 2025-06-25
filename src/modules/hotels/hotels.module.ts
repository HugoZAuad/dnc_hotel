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

@Module({
  imports: [PrismaModule],
  controllers: [HotelsController],
  providers: [
    CreateHotelsService,
    FindAllHotelsService,
    FindOneHotelsService,
    DeleteHotelsService,
    UpdateHotelsService,
    {
      provide: HOTEL_REPOSITORIES_TOKEN,
      useClass: HotelRepositories
    }],
})
export class HotelsModule { }

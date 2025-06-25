import { Module } from '@nestjs/common'
import { HotelsController } from './infra/hotels.controller'
import { CreateHotelsService } from './services/createHotel.service'
import { FindAllHotelsService } from './services/findAllHotel.service'
import { FindOneHotelsService } from './services/findOneHotel.service'
import { DeleteHotelsService } from './services/deleteHotel.Service'
import { UpdateHotelsService } from './services/updateHotel.service'

@Module({
  controllers: [HotelsController],
  providers: [CreateHotelsService, FindAllHotelsService, FindOneHotelsService, DeleteHotelsService, UpdateHotelsService],
})
export class HotelsModule { }

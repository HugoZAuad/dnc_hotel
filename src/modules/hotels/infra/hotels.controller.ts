import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateHotelsService } from '../services/createHotel.service'
import { FindAllHotelsService } from '../services/findAllHotel.service'
import { FindOneHotelsService } from '../services/findOneHotel.service'
import { DeleteHotelsService } from '../services/deleteHotel.Service'
import { UpdateHotelsService } from '../services/updateHotel.service'
import { CreateHotelDTO } from '../domain/dto/createHotel.dto'
import { UpdateHotelDTO } from '../domain/dto/updateHotel.dto'

@Controller('hotels')
export class HotelsController {
  constructor(
    private readonly createhotelsService: CreateHotelsService,
    private readonly findAllhotelsService: FindAllHotelsService,
    private readonly findOnehotelsService: FindOneHotelsService,
    private readonly deleteHotelsService: DeleteHotelsService,
    private readonly updatehotelsService: UpdateHotelsService
  ) {}

  @Post()
  create(@Body() createHotelDto: CreateHotelDTO) {
    return this.createhotelsService.execute(createHotelDto);
  }

  @Get()
  findAll() {
    return this.findAllhotelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.findOnehotelsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHotelDto: UpdateHotelDTO) {
    return this.updatehotelsService.update(+id, updateHotelDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deleteHotelsService.delete(+id);
  }
}

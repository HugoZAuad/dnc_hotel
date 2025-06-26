import { Controller, Get, Post, Body, Patch, Delete, UseGuards } from '@nestjs/common'
import { ReservationRepositories } from './reservations.repositories'
import { AuthGuard } from 'src/shared/guard/auth.guard'
import { User } from 'src/shared/decorators/user.decorator'
import { CreateReservationDto } from '../domain/dto/create-reservation.dto'
import { FindAllReservationsService } from '../services/findAllReservations.service'
import { FindByIdReservationsService } from '../services/findByIdReservations.service'
import { ParamId } from 'src/shared/decorators/ParamId.decorator'
import { CreateReservationsService } from '../services/createReservations.service'

@UseGuards(AuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly createReservationsService: CreateReservationsService,
    private readonly findAllReservationsService: FindAllReservationsService,
    private readonly findByIDReservationsService: FindByIdReservationsService,
  ) { }

  @Post()
  create(@User('id') id: number, @Body() body: CreateReservationDto) {
    return this.createReservationsService.create(id, body)
  }

  @Get()
  findAll() {
    return this.findAllReservationsService.execute()
  }
  
  @Get('user')
  findByUser(@User('id') id: number) {
    return this.findByIDReservationsService.execute(id)
  }

  @Get(':id')
  findOne(@ParamId() id: number) {
    return this.findByIDReservationsService.execute(id)
  }

}

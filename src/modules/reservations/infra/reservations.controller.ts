import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ReservationRepositories } from './reservations.repositories'
import { CreateReservationDto } from '../domain/dto/create-reservation.dto'
import { AuthGuard } from 'src/shared/guard/auth.guard'
import { User } from 'src/shared/decorators/user.decorator'


@UseGuards(AuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationRepositories) {}

  @Post()
  create(@User('id') id: number, @Body() body: any) {
    return this.reservationsService.create(body);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from 'src/shared/guard/auth.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { CreateReservationDto } from '../domain/dto/create-reservation.dto';
import { FindAllReservationsService } from '../services/findAllReservations.service';
import { FindByIdReservationsService } from '../services/findByIdReservations.service';
import { ParamId } from 'src/shared/decorators/ParamId.decorator';
import { CreateReservationsService } from '../services/createReservations.service';
import { ReservationStatus, Role } from 'generated/prisma/client';
import { UpdateStatusReservationService } from '../services/updateStatusReservations.service';
import { RoleGuard } from 'src/shared/guard/role.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { FindByUserReservationsService } from '../services/findByUserReservations.service';

@UseGuards(AuthGuard, RoleGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly createReservationsService: CreateReservationsService,
    private readonly findAllReservationsService: FindAllReservationsService,
    private readonly findByIDReservationsService: FindByIdReservationsService,
    private readonly updateStatusReservationService: UpdateStatusReservationService,
    private readonly findByUserReservationsService: FindByUserReservationsService,
  ) {}

  @Roles(Role.USER)
  @Post()
  create(@User('id') id: number, @Body() body: CreateReservationDto) {
    return this.createReservationsService.create(id, body);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.findAllReservationsService.execute(Number(page), Number(limit));
  }

  @Get('user')
  findByUser(@User('id') id: number) {
    return this.findByUserReservationsService.execute(id);
  }

  @Get(':id')
  findOne(@ParamId() id: number) {
    return this.findByIDReservationsService.execute(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  updateStatus(
    @ParamId() id: number,
    @Body('status') status: ReservationStatus,
  ) {
    return this.updateStatusReservationService.execute(id, status);
  }
}

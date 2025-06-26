import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CreateReservationDto } from '../domain/dto/create-reservation.dto'
import { RESERVATION_REPOSITORIES_TOKEN } from '../utils/repositoriesReservation.Tokens'
import { ReservationRepositories } from '../infra/reservations.repositories'
import { differenceInDays, parseISO } from 'date-fns'
import { HotelRepositories } from 'src/modules/hotels/infra/hotels.repository'
import { Reservation, ReservationStatus } from 'generated/prisma/client'

@Injectable()
export class CreateReservationsService {
  constructor(
    @Inject(RESERVATION_REPOSITORIES_TOKEN)
    private readonly reservationsRepositories: ReservationRepositories,
    private readonly hotelRespositories: HotelRepositories,
  ) { }
  async create(id: number, data: CreateReservationDto) {
    const checkInDate = parseISO(data.checkIn)
    const checkOutDate = parseISO(data.checkOut)
    const daysOffStay = differenceInDays(checkInDate, checkOutDate)
    if(checkInDate >= checkOutDate){
      throw new BadRequestException('A data de Check-out deve ser depois da data de Check-in')
    }

    const hotel = await this.hotelRespositories.findHotelById(data.hotelId)
    if(!hotel){
      throw new NotFoundException('Hotel não encontrado')
    }

    if(typeof hotel.price !== 'number' || hotel.price <= 0){
      throw new BadRequestException('Preço do hotel invalido')
    }

    const total = daysOffStay * hotel.price
    const newReservation = {
      ...data,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      total,
      userId: id,
      status: ReservationStatus.PENDING
    }

    return this.reservationsRepositories.create(newReservation)
  }
}
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CreateReservationDto } from '../domain/dto/create-reservation.dto'
import { RESERVATION_REPOSITORIES_TOKEN } from '../utils/repositoriesReservation.Tokens'
import { ReservationRepositories } from '../infra/reservations.repositories'
import { differenceInDays, parseISO } from 'date-fns'
import { HotelRepositories } from 'src/modules/hotels/infra/hotels.repository'
import { ReservationStatus } from 'generated/prisma/client'
import { HOTEL_REPOSITORIES_TOKEN } from 'src/modules/hotels/utils/repositoriesHotel.Tokens'
import { MailerService } from '@nestjs-modules/mailer'
import { UserService } from 'src/modules/users/user.services'

@Injectable()
export class CreateReservationsService {
  constructor(
    @Inject(RESERVATION_REPOSITORIES_TOKEN)
    private readonly ReservationsRepositories: ReservationRepositories,
    @Inject(HOTEL_REPOSITORIES_TOKEN)
    private readonly hotelRespositories: HotelRepositories,
    private readonly mailerService: MailerService,
    private readonly userService: UserService
  ) { }
  async create(id: number, data: CreateReservationDto) {
    const checkInDate = parseISO(data.checkIn)
    const checkOutDate = parseISO(data.checkOut)
    const daysOffStay = differenceInDays(checkInDate, checkOutDate)
    if (checkInDate >= checkOutDate) {
      throw new BadRequestException('A data de Check-out deve ser depois da data de Check-in')
    }

    const hotel = await this.hotelRespositories.findHotelById(data.hotelId)
    if (!hotel) {
      throw new NotFoundException('Hotel não encontrado')
    }

    if (typeof hotel.price !== 'number' || hotel.price <= 0) {
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

    const hotelOwner = await this.userService.show(hotel.ownerId)

    await this.mailerService.sendMail({
      to: hotelOwner.email,
      subject: "Reserva pendente de aprovação",
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; text-align: center; border: 2px solid #041d40; border-radius: 10px; margin: auto; width: 60%;">
      <h1 style="color: #041d40;">Pending Reservation Approval</h1>
      <h3 style="color: #041d40;">Dear Hotel Owner,</h3>
      <p style="font-size: 16px; color: #333;">
      You have a new reservation pending approval. Please review the reservation details and approve or decline the reservation at your earliest convenience.
      </p>
      <p style="font-size: 16px; color: #333;">
      To view the reservation, please access your hotel owner profile
      </p>
      <p style="margin-top: 20px;">
      Thank you for your prompt attention to this matter.<br>
      Best regards,<br>
      <span style="font-weight: bold; color: #041d40;">DNC Hotel Management System</span>
      </p>
      </div>
      `
    })

    return this.ReservationsRepositories.create(newReservation)
  }
}
import { Reservation } from "generated/prisma/client"
import { CreateReservationDto } from "../dto/create-reservation.dto"

export interface IReservationRepositories {
  create(data: CreateReservationDto): Promise<Reservation>
  findById(id: number): Promise<Reservation>
  findAll(offSet, limit): Promise<Reservation[]>
  findByUser(userId: number): Promise<Reservation[]>
  countReservations(): Promise<number>
}
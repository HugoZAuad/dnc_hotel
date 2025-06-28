import { Reservation, ReservationStatus } from "generated/prisma/client"
import { CreateReservationDto } from "../dto/create-reservation.dto"

export interface IReservationRepositories {
  create(data: CreateReservationDto): Promise<Reservation>
  findById(id: number): Promise<Reservation | null>
  findAll(offSet: number, limit: number): Promise<Reservation[]>
  findByUser(userId: number): Promise<Reservation[]>
  countReservations(): Promise<number>
  updateStatus(id: number, status: ReservationStatus): Promise<Reservation>
}
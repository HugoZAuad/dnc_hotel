import { PrismaService } from 'src/modules/prisma/prisma.service'
import { Injectable } from "@nestjs/common"
import { IReservationRepositories } from "../domain/repositories/IReservations.repositories"
import { Reservation, ReservationStatus } from "generated/prisma"
import { CreateReservationDto } from '../domain/dto/create-reservation.dto'


@Injectable()
export class ReservationRepositories implements IReservationRepositories {
  constructor(private readonly prisma: PrismaService) { }
  create(data: any): Promise<Reservation> {
    return this.prisma.reservation.create({ data })
  }
  findById(id: number): Promise<Reservation> {
    return this.prisma.reservation.findUnique({ where: { id } })
  }
  findAll(offSet: number, limit: number): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({
      take: limit,
      skip: offSet,
    })
  }
  findByUser(userId: number): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({ where: { userId } })
  }
  
  updateStatus(id: number, status: ReservationStatus): Promise<Reservation> {
    return this.prisma.reservation.update({where: {id}, data: {status}})
  }
  
  countReservations(): Promise<number> {
    return this.prisma.hotel.count()
  }
  
}
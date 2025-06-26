import { PrismaService } from 'src/modules/prisma/prisma.service'
import { Injectable } from "@nestjs/common"
import { IReservationRepositories } from "../domain/repositories/IReservations.repositories"
import { Reservation } from "generated/prisma"
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
  findAll(): Promise<Reservation[]> {
    return this.prisma.reservation.findMany()
  }
  findByUser(userId: number): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({ where: { userId } })
  }

}
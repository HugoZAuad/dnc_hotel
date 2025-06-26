import { Hotel } from "generated/prisma"
import { CreateHotelDTO } from "../domain/dto/createHotel.dto"
import { IHotelRepositories } from "../domain/repositories/IHotel.repositories"
import { PrismaService } from "src/modules/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { UpdateHotelDTO } from "../domain/dto/updateHotel.dto"

@Injectable()
export class HotelRepositories implements IHotelRepositories {
  constructor(private readonly prisma: PrismaService) { }

  createHotel(data: CreateHotelDTO, id: number): Promise<Hotel> {
    data.ownerId = id
    return this.prisma.hotel.create({ data })
  }
  findHotelById(id: number): Promise<Hotel | null> {
    return this.prisma.hotel.findUnique({ where: { id: Number(id) }, include: {owner: true} })
  }
  findHotelByName(name: string): Promise<Hotel[] | null> {
    return this.prisma.hotel.findMany({ where: { name: { contains: name, mode: 'insensitive' } } })
  }

  findHotels(offSet: number, limit: number): Promise<Hotel[]> {
    return this.prisma.hotel.findMany({
      take: limit,
      skip: offSet,
      include: { owner: true }
    })
  }

  countHotels(): Promise<number> {
    return this.prisma.hotel.count()
  }

  findHotelByOwner(ownerId: number): Promise<Hotel[]> {
    return this.prisma.hotel.findMany({ where: { ownerId } })
  }

  updateHotel(id: number, data: UpdateHotelDTO): Promise<Hotel> {
    return this.prisma.hotel.update({ where: { id }, data })
  }
  deleteHotel(id: number): Promise<Hotel> {
    return this.prisma.hotel.delete({ where: { id } })
  }
}
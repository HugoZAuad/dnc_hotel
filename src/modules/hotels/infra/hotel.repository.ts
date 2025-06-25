import { Hotel } from "generated/prisma"
import { CreateHotelDTO } from "../domain/dto/createHotel.dto"
import { IHotelRepositories } from "../domain/repositories/IHotel.repositories"
import { PrismaService } from "src/modules/prisma/prisma.service"
import { Injectable } from "@nestjs/common"

@Injectable()
export class HotelRepositories implements IHotelRepositories {
  constructor(private readonly prisma: PrismaService) { }
  createHotel(data: CreateHotelDTO): Promise<Hotel> {
    return this.prisma.hotel.create({ data })
  }
  findHotelById(id: number): Promise<Hotel | null> {
    throw new Error("Method not implemented.")
  }
  findHotelByName(name: string): Promise<Hotel | null> {
    throw new Error("Method not implemented.")
  }
  findHotels(): Promise<Hotel[]> {
    throw new Error("Method not implemented.")
  }
  updateHotel(id: number, data: CreateHotelDTO): Promise<Hotel> {
    throw new Error("Method not implemented.")
  }
  deleteHotel(id: number): Promise<Hotel> {
    throw new Error("Method not implemented.")
  }


}
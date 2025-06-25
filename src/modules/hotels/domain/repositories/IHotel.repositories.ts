import { Hotel } from "generated/prisma/client"
import { CreateHotelDTO } from "../dto/createHotel.dto"

export interface IHotelRepositories{
  createHotel(data: CreateHotelDTO): Promise<Hotel>
  findHotelById(id: number): Promise<Hotel | null>
  findHotelByName(name: string): Promise<Hotel | null>
  findHotels(): Promise<Hotel[]>
  updateHotel(id: number, data: CreateHotelDTO): Promise<Hotel>
  deleteHotel(id: number): Promise<Hotel>
}
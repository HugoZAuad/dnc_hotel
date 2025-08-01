import { Hotel } from "generated/prisma/client"
import { CreateHotelDTO } from "../dto/createHotel.dto"
import { UpdateHotelDTO } from "../dto/updateHotel.dto"

export interface IHotelRepositories{
  createHotel(data: CreateHotelDTO, id: number): Promise<Hotel>
  findHotelById(id: number): Promise<Hotel | null>
  findHotelByName(name: string): Promise<Hotel[] | null>
  findHotels(offSet, limit): Promise<Hotel[]>
  updateHotel(id: number, data: UpdateHotelDTO): Promise<Hotel>
  deleteHotel(id: number): Promise<Hotel>
  findHotelByOwner(ownerId: number): Promise<Hotel[]>
  countHotels(): Promise<number>
}
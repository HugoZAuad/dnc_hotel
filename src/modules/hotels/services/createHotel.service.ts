import { Inject, Injectable } from '@nestjs/common'
import { CreateHotelDTO } from '../domain/dto/createHotel.dto'
import { IHotelRepositories } from '../domain/repositories/IHotel.repositories'
import { HOTEL_REPOSITORIES_TOKEN } from '../utils/repositoriesHotel.Tokens'

@Injectable()
export class CreateHotelsService {
  constructor(
    @Inject(HOTEL_REPOSITORIES_TOKEN)
    private readonly hotelRepositories: IHotelRepositories) { }
  async execute(createHotelDto: CreateHotelDTO, id: number) {
    return await this.hotelRepositories.createHotel(createHotelDto, id)
  }

}

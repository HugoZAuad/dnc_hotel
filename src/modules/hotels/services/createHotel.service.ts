import { Inject, Injectable } from '@nestjs/common'
import { CreateHotelDTO } from '../domain/dto/createHotel.dto'
import { IHotelRepositories } from '../domain/repositories/IHotel.repositories'
import { HOTEL_REPOSITORIES_TOKEN } from '../utils/repositoriesTokens'

@Injectable()
export class CreateHotelsService {
  constructor(
    @Inject(HOTEL_REPOSITORIES_TOKEN)
    private readonly hotelRepositories: IHotelRepositories) { }
  async execute(createHotelDto: CreateHotelDTO) {
    return await this.hotelRepositories.createHotel(createHotelDto)
  }

}

import { Inject, Injectable } from '@nestjs/common';
import { UpdateHotelDTO } from '../domain/dto/updateHotel.dto';
import { IHotelRepositories } from '../domain/repositories/IHotel.repositories'
import { HOTEL_REPOSITORIES_TOKEN } from '../utils/repositoriesHotel.Tokens'

@Injectable()
export class UpdateHotelsService {
  constructor(
          @Inject(HOTEL_REPOSITORIES_TOKEN)
          private readonly hotelRepositories: IHotelRepositories) { }
  async execute(id: number, updateHotelDto: UpdateHotelDTO) {
    return await this.hotelRepositories.updateHotel(id, updateHotelDto)
  }

}

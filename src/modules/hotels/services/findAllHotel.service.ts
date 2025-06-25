import { Inject, Injectable } from '@nestjs/common';
import { HOTEL_REPOSITORIES_TOKEN } from '../utils/repositoriesHotel.Tokens'
import { IHotelRepositories } from '../domain/repositories/IHotel.repositories'


@Injectable()
export class FindAllHotelsService {
  constructor(
      @Inject(HOTEL_REPOSITORIES_TOKEN)
      private readonly hotelRepositories: IHotelRepositories) { }
  async execute() {
    return await this.hotelRepositories.findHotels()
  }
}

import { Inject, Injectable } from '@nestjs/common'
import { HOTEL_REPOSITORIES_TOKEN } from '../utils/repositoriesHotel.Tokens'
import { IHotelRepositories } from '../domain/repositories/IHotel.repositories'


@Injectable()
export class FindAllHotelsService {
  constructor(
    @Inject(HOTEL_REPOSITORIES_TOKEN)
    private readonly hotelRepositories: IHotelRepositories) { }
  async execute(page: number = 1, limit: number = 10) {
    const offSet = (page - 1) * limit
    const data = await this.hotelRepositories.findHotels(offSet, limit)
    const total = await this.hotelRepositories.countHotels()

    return {

      total,
      page,
      per_page: limit,
      data
    }
  }
}

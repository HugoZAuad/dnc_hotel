import { Inject, Injectable } from '@nestjs/common'
import { IHotelRepositories } from '../domain/repositories/IHotel.repositories'
import { HOTEL_REPOSITORIES_TOKEN } from '../utils/repositoriesHotel.Tokens'


@Injectable()
export class FindOneHotelsService {
  constructor(
    @Inject(HOTEL_REPOSITORIES_TOKEN)
    private readonly hotelRepositories: IHotelRepositories) { }
  async execute(id: number) {
    return await this.hotelRepositories.findHotelById(id)
  }
}

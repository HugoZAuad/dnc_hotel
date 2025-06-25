import { Inject, Injectable } from '@nestjs/common'
import { IHotelRepositories } from '../domain/repositories/IHotel.repositories'
import { HOTEL_REPOSITORIES_TOKEN } from '../utils/repositoriesHotel.Tokens'

@Injectable()
export class DeleteHotelsService {
  constructor(
    @Inject(HOTEL_REPOSITORIES_TOKEN)
    private readonly hotelRepositories: IHotelRepositories) { }
  execute(id: number) {
    return this.hotelRepositories.deleteHotel(id)
  }
}

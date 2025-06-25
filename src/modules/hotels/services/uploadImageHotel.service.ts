import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IHotelRepositories } from '../domain/repositories/IHotel.repositories'
import { HOTEL_REPOSITORIES_TOKEN } from '../utils/repositoriesHotel.Tokens'
import { unlink } from 'fs/promises'
import { join, resolve } from 'path'
import { stat } from 'fs/promises'

@Injectable()
export class UploadImageHotelService {
  constructor(
    @Inject(HOTEL_REPOSITORIES_TOKEN)
    private readonly hotelRepositories: IHotelRepositories) { }
  async execute(id: string, imageFileName: string) {
    const hotel = await this.hotelRepositories.findHotelById(Number(id))
    const directory = resolve(__dirname, '..', '..', '..', '..', 'uploads-hotel')
    if (!hotel) {
      throw new NotFoundException('Hotel não encontrado')
    }

    if(hotel.image){
      const hotelImageFilePath = join(directory, hotel.image)
      const hotelImageFileExists = await stat(hotelImageFilePath)

      if(hotelImageFileExists){
        await unlink(hotelImageFilePath)
      }
    }
    return await this.hotelRepositories.updateHotel(Number(id), { image: imageFileName })
  }

}

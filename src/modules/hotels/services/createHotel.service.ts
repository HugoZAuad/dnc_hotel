import { Injectable } from '@nestjs/common';
import { CreateHotelDTO } from '../domain/dto/createHotel.dto';

@Injectable()
export class CreateHotelsService {
  execute(createHotelDto: CreateHotelDTO) {
    return 'This action adds a new hotel';
  }

}

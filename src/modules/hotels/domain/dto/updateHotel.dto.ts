import { PartialType } from '@nestjs/mapped-types';
import { CreateHotelDTO } from './createHotel.dto';

export class UpdateHotelDTO extends PartialType(CreateHotelDTO) {}

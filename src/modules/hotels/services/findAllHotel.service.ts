import { Injectable } from '@nestjs/common';


@Injectable()
export class FindAllHotelsService {
  findAll() {
    return `This action returns all hotels`;
  }
}

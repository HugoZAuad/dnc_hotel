import { Injectable } from '@nestjs/common';


@Injectable()
export class FindOneHotelsService {
  findOne(id: number) {
    return `This action returns a #${id} hotel`;
  }
}

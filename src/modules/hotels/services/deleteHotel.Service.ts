import { Injectable } from '@nestjs/common';

@Injectable()
export class DeleteHotelsService {
  delete(id: number) {
    return `This action removes a #${id} hotel`;
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class DeleteHotelsService {
  execute(id: number) {
    return `This action removes a #${id} hotel`;
  }
}

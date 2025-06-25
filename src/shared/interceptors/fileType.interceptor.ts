import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class FileTypeinterceptor implements PipeTransform {
  transform(file: Express.Multer.File) {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png'];
    const allowedMimeSize = [900 * 1024];

    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de arquivo inválido: ${file.mimetype}. Tipos permitidos: ${allowedMimeTypes.join(', ')}`,
      );
    }

    return file;
  }
}

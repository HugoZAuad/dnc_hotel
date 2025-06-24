import { unlink } from 'fs';
import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { catchError, Observable, throwError } from "rxjs"

@Injectable()
export class FileValidationInterceptor implements NestInterceptor{
  intercept(context: ExecutionContext, next: CallHandler): Observable<any>{
    return next.handle().pipe(
      catchError((err) => {
        if(err instanceof BadRequestException){
          const request = context.switchToHttp().getRequest()
          const file = request.file
          if(file) {
            unlink(file.path, (unlinkErr) => {
              if(unlinkErr) console.error('Erro ao remover o arquivo: ', unlinkErr)
            })
          }
        }
        return throwError(() => err)
      })
    )
  }
}
  
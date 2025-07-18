import { Transform } from "class-transformer"
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"
import { ReservationStatus } from "generated/prisma"

export class CreateReservationDto {
  @IsNumber()
  @IsNotEmpty()
  hotelId: number

  @IsString()
  @IsNotEmpty()
  checkIn: string

  @IsString()
  @IsNotEmpty()
  checkOut: string

  @IsEnum(ReservationStatus)
  @IsOptional()
  @Transform(value => value ?? ReservationStatus.PENDING)
  status: ReservationStatus
}

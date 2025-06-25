import { Description } from './../../../../../node_modules/mjml-cli/node_modules/jackspeak/dist/commonjs/index.d'
import { IsDecimal, IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator"

export class CreateHotelDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  Description: string

  @IsString()
  @MaxLength(255)
  image: string

  @IsDecimal()
  @IsNotEmpty()
  price: number

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string

  @IsNumber()
  @IsNotEmpty()
  ownerId: number
}
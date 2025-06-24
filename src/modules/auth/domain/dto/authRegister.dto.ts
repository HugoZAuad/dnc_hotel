import { PartialType } from "@nestjs/mapped-types"
import { createUserDTO } from "src/modules/users/domain/dto/CreateUser.dto"

export class AuthRegisterDTO extends PartialType(createUserDTO){}

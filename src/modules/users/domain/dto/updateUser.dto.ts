import { PartialType } from "@nestjs/mapped-types"
import { createUserDTO } from "./CreateUser.dto"


export class updateUserDTO extends PartialType(createUserDTO) {}
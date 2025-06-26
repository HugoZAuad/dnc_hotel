import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common'
import { CreateHotelsService } from '../services/createHotel.service'
import { FindAllHotelsService } from '../services/findAllHotel.service'
import { FindOneHotelsService } from '../services/findOneHotel.service'
import { DeleteHotelsService } from '../services/deleteHotel.service'
import { UpdateHotelsService } from '../services/updateHotel.service'
import { CreateHotelDTO } from '../domain/dto/createHotel.dto'
import { UpdateHotelDTO } from '../domain/dto/updateHotel.dto'
import { ParamId } from 'src/shared/decorators/ParamId.decorator'
import { FindByNameHotelService } from '../services/findByNameHotel.service'
import { FindByOwnerHotelService } from '../services/findByOwnerHotel.service'
import { AuthGuard } from 'src/shared/guard/auth.guard'
import { RoleGuard } from 'src/shared/guard/role.guard'
import { Roles } from 'src/shared/decorators/roles.decorator'
import { Role } from 'generated/prisma'
import { OwnerHotelGuard } from 'src/shared/guard/ownerHotel.guard'
import { User } from 'src/shared/decorators/user.decorator'
import { FileTypeinterceptor } from 'src/shared/interceptors/fileType.interceptor'
import { UploadImageHotelService } from '../services/uploadImageHotel.service'
import { FileValidationInterceptor } from 'src/shared/interceptors/fileValidation.interceptor'
import { FileInterceptor } from '@nestjs/platform-express'

@UseGuards(AuthGuard, RoleGuard)
@Controller('hotels')
export class HotelsController {
  constructor(
    private readonly createhotelsService: CreateHotelsService,
    private readonly findAllhotelsService: FindAllHotelsService,
    private readonly findOnehotelsService: FindOneHotelsService,
    private readonly deleteHotelsService: DeleteHotelsService,
    private readonly findByOwnerHotel: FindByOwnerHotelService,
    private readonly findByNameHotel: FindByNameHotelService,
    private readonly updatehotelsService: UpdateHotelsService,
    private readonly uploadImageHotelService: UploadImageHotelService
  ) { }

  @Roles(Role.ADMIN)
  @Post()
  create(@User('id') id: number, @Body() createHotelDto: CreateHotelDTO) {
    return this.createhotelsService.execute(createHotelDto, id)
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get()
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return this.findAllhotelsService.execute(Number(page), Number(limit))
  }

  @Roles(Role.ADMIN)
  @Get('owner')
  findOwner(@User('id') id: number) {
    return this.findByOwnerHotel.execute(id)
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get('name')
  FindName(@Query('name') name: string) {
    return this.findByNameHotel.execute(name)
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get(':id')
  findOne(@ParamId() id: number) {
    return this.findOnehotelsService.execute(id)
  }

  @UseInterceptors(FileInterceptor('avatar'), FileValidationInterceptor)
  @Patch('image/:hotelId')
  uploadImage(
    @Param('hotelId') id: string,
    @UploadedFile(
      (FileTypeinterceptor)
    ) image: Express.Multer.File) {
    return this.uploadImageHotelService.execute(id, image.filename)
  }

  @UseGuards(OwnerHotelGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@ParamId() id: number, @Body() updateHotelDto: UpdateHotelDTO) {
    return this.updatehotelsService.execute(id, updateHotelDto)
  }

  @UseGuards(OwnerHotelGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  delete(@ParamId() id: number) {
    return this.deleteHotelsService.execute(id)
  }
}

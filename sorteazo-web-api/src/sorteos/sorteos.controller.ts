import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException, UseGuards, UseInterceptors, UploadedFiles, ConflictException } from '@nestjs/common';
import { SorteosService } from './sorteos.service';
import { CreateSorteoDto } from './dto/create-sorteo.dto';
import { UpdateSorteoDto } from './dto/update-sorteo.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../configs/multer.config';

@UseGuards(AuthGuard("jwt"))
@Controller('sorteos')
export class SorteosController {
  constructor(private readonly sorteosService: SorteosService) { }

  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'imagenSorteo', maxCount: 1 },
    { name: 'imagenesPremios', maxCount: 10 },
  ], multerConfig))
  create(
    @Body() createSorteoDto: CreateSorteoDto,
    @UploadedFiles() files: { imagenSorteo?: Express.Multer.File[], imagenesPremios?: Express.Multer.File[] },
    @Req() req
  ) {
    const user = req.user;
    if (user.role != "organizador") throw new UnauthorizedException("Organizador rol required, not authorized.");
    return this.sorteosService.create(createSorteoDto, user.sub, files);
  }

  @Get()
  findAll() {
    return this.sorteosService.findAll();
  }

  @Get('organizador/mis-sorteos')
  findSorteosByOrganizador(@Req() req) {
    const user = req.user;
    console.log(user);
    //console.log()
    if (user.role != "organizador") throw new UnauthorizedException("No tienes permiso para ver esto.");
    return this.sorteosService.findAllByOrganizador(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sorteosService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSorteoDto: UpdateSorteoDto,
    @Req() req
  ) {
    const user = req.user;

    if (user.role !== "organizador") {
      throw new UnauthorizedException("No tienes permisos para realizar esta acción.");
    }

    return this.sorteosService.update(id, updateSorteoDto, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const user = req.user;

    if (user.role != "organizador") {
      throw new UnauthorizedException("No tienes permisos para realizar esta acción.");
    }

    await this.sorteosService.remove(id, user.id);
    return { "message": "Se eliminó el sorteo con éxito." };
  }
  
}

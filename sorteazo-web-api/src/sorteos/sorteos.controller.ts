import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UnauthorizedException, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { SorteosService } from './sorteos.service';
import { CreateSorteoDto } from './dto/create-sorteo.dto';
import { UpdateSorteoDto } from './dto/update-sorteo.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../configs/multer.config';

@UseGuards(AuthGuard("jwt"))
@Controller('sorteos')
export class SorteosController {
  constructor(private readonly sorteosService: SorteosService) {}

  @Post('create')
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
    if(user.role != "organizador") throw new UnauthorizedException("Organizador rol required, not authorized.");
    return this.sorteosService.create(createSorteoDto, user.sub, files);
  }

  @Get()
  findAll() {
    return this.sorteosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sorteosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSorteoDto: UpdateSorteoDto) {
    return this.sorteosService.update(+id, updateSorteoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sorteosService.remove(+id);
  }
}

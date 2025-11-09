import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SorteosService } from './sorteos.service';
import { CreateSorteoDto } from './dto/create-sorteo.dto';
import { UpdateSorteoDto } from './dto/update-sorteo.dto';

@Controller('sorteos')
export class SorteosController {
  constructor(private readonly sorteosService: SorteosService) {}

  @Post()
  create(@Body() createSorteoDto: CreateSorteoDto) {
    return this.sorteosService.create(createSorteoDto);
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

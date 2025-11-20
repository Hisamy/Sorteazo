import {
  Controller,
  Get, Post, Body, Patch, Delete,
  Param,
  Request,
  ForbiddenException, UnauthorizedException,
  UseGuards
} from '@nestjs/common';

import { JwtStrategy } from '../users/strategies/jwt.strategy';
import { AuthGuard } from '@nestjs/passport';

import { BoletosService } from './boletos.service';
import { CreateBoletoDto } from './dto/create-boleto.dto';
import { UpdateBoletoDto } from './dto/update-boleto.dto';
import { ReserveBoletoDto } from './dto/reserve-boleto.dto';

@Controller('boletos')
export class BoletosController {
  constructor(private readonly boletosService: BoletosService) { }

  @Post()
  create(@Body() createBoletoDto: CreateBoletoDto) {
    return this.boletosService.create(createBoletoDto);
  }

  @Get(':sorteoId')
  findAllBySorteoForClient(@Param('sorteoId') sorteoId: string) {
    return this.boletosService.findAllBySorteoForClient(sorteoId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/organizador/:sorteoId')
  findAllBySorteoForOrganizador(@Param('sorteoId') sorteoId: string, @Request() req) {

    if (!req.user || req.user.role !== 'organizador') {
      throw new UnauthorizedException('No cuentas con los permisos necesarios para acceder a este recurso');
    }

    return this.boletosService.findAllBySorteoForOrganizador(sorteoId, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('reserve')
  reserveBoletos(@Body() reserveBoletoDto: ReserveBoletoDto, @Request() req) {
    if (!req.user || req.user.role !== 'client') {
      throw new UnauthorizedException('Solo los clientes pueden reservar boletos');
    }

    return this.boletosService.reserveBoletos(reserveBoletoDto, req.user.id);
  }

  @Get('detalles/:id')
  findOne(@Param('id') id: string) {
    return this.boletosService.findOne(+id);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBoletoDto: UpdateBoletoDto) {
    return this.boletosService.update(+id, updateBoletoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boletosService.remove(+id);
  }
}

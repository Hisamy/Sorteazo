import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Req, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../configs/multer.config';

@UseGuards(AuthGuard('jwt'))
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post('transfer')
  @UseInterceptors(FileInterceptor('comprobantePago', multerConfig))
  create(
    @Body() createPagoDto: CreatePagoDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const user = req.user;
    if (user.role !== 'client') {
      throw new UnauthorizedException('Solo los clientes pueden registrar pagos.');
    }
    if (!file) {
      throw new BadRequestException('Payment receipt file is required for transfer payments.');
    }
    return this.pagosService.create(createPagoDto, user.sub, file);
  }

  @Post('simulate-online')
  simulateOnline(@Body('boletoId') boletoId: string, @Req() req) {
    const user = req.user;
    if (user.role !== 'client') {
      throw new UnauthorizedException('Solo los clientes pueden registrar pagos.');
    }
    const userId = user.sub;
    return this.pagosService.simulateFullOnlinePayment(boletoId, userId);
  }

  @Get()
  findAll() {
    return this.pagosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePagoDto: UpdatePagoDto) {
    return this.pagosService.update(+id, updatePagoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagosService.remove(+id);
  }
}

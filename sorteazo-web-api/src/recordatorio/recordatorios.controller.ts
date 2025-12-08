import { Controller, Patch, Param, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RecordatorioService } from './recordatorios.service';
import { UpdateRecordatorioConfigDto } from './dto/update-recordatorio-config.dto';

@UseGuards(AuthGuard("jwt"))
@Controller('sorteos/:id/config-recordatorios')
export class RecordatorioController {
  constructor(private readonly recordatorioService: RecordatorioService) { }

  @Patch()
  update(
    @Param('id') idSorteo: string,
    @Body() dto: UpdateRecordatorioConfigDto,
    @Req() req
  ) {
    const user = req.user;

    if (user.role !== "organizador") {
      throw new UnauthorizedException("No tienes permisos.");
    }


    return this.recordatorioService.updateConfig(idSorteo, dto, user.id);
  }
}

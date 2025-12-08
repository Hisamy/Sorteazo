import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordatorioConfig } from './entities/recordatorio-config.entity';
import { UpdateRecordatorioConfigDto } from './dto/update-recordatorio-config.dto';
import { Sorteo } from '../sorteos/entities/sorteo.entity';

@Injectable()
export class RecordatorioService {
  constructor(
    @InjectRepository(RecordatorioConfig)
    private readonly configRepository: Repository<RecordatorioConfig>,

    @InjectRepository(Sorteo)
    private readonly sorteoRepository: Repository<Sorteo>,
  ) { }

  async updateConfig(
    idSorteo: string,
    dto: UpdateRecordatorioConfigDto,
    idOrganizador: string
  ) {
    const sorteo = await this.sorteoRepository.findOne({
      where: { id: idSorteo },
      relations: ['organizador', 'recordatorioConfig']
    });

    if (!sorteo) throw new NotFoundException('Sorteo no encontrado.');

    if (sorteo.organizador.userId !== idOrganizador) {
      throw new UnauthorizedException("No tienes permisos para modificar este sorteo.");
    }

    let config = sorteo.recordatorioConfig;
    let esNuevo = false;

    if (!config) {
      esNuevo = true;
      config = this.configRepository.create({
        sorteo: sorteo
      });
    }

    if (dto.frequencyDays !== undefined) config.frequencyDays = dto.frequencyDays;
    if (dto.sendTime !== undefined) config.sendTime = dto.sendTime;
    if (dto.subject !== undefined) config.subject = dto.subject;
    if (dto.body !== undefined) config.body = dto.body;

    const configGuardada = await this.configRepository.save(config);


    if (esNuevo) {
      sorteo.recordatorioConfig = configGuardada;
      await this.sorteoRepository.save(sorteo);
    }

    return configGuardada;
  }
}

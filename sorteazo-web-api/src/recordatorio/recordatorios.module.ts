import { Module } from '@nestjs/common';
import { RecordatorioService } from './recordatorios.service';
import { RecordatorioController } from './recordatorios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordatorioConfig } from './entities/recordatorio-config.entity';
import { Sorteo } from '../sorteos/entities/sorteo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecordatorioConfig, Sorteo])
  ],
  controllers: [RecordatorioController],
  providers: [RecordatorioService],
})
export class RecordatorioModule {}

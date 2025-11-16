import { Module } from '@nestjs/common';
import { BoletosService } from './boletos.service';
import { BoletosController } from './boletos.controller';
import { Boleto } from './entities/boleto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sorteo } from '../sorteos/entities/sorteo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Boleto, Sorteo]),
  ],
  controllers: [BoletosController],
  providers: [BoletosService],
})
export class BoletosModule {}

import { Module } from '@nestjs/common';
import { SorteosService } from './sorteos.service';
import { SorteosController } from './sorteos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sorteo } from './entities/sorteo.entity';
import { Premio } from './entities/premio.entity';
import { Boleto } from '../boletos/entities/boleto.entity';
import { Organizador } from '../users/entities/organizador.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Sorteo, Premio, Boleto, Organizador])
  ],
  controllers: [SorteosController],
  providers: [SorteosService],
})
export class SorteosModule {}

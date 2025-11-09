import { Module } from '@nestjs/common';
import { BoletosService } from './boletos.service';
import { BoletosController } from './boletos.controller';
import { Boleto } from './entities/boleto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Boleto]),
  ],
  controllers: [BoletosController],
  providers: [BoletosService],
})
export class BoletosModule {}

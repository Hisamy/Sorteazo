import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { Comprobante } from './entities/comprobante.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago, Comprobante])
  ],
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}

import { Module } from '@nestjs/common';
import { SorteosService } from './sorteos.service';
import { SorteosController } from './sorteos.controller';

@Module({
  controllers: [SorteosController],
  providers: [SorteosService],
})
export class SorteosModule {}

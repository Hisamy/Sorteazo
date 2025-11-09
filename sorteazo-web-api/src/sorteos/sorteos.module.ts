import { Module } from '@nestjs/common';
import { SorteosService } from './sorteos.service';
import { SorteosController } from './sorteos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sorteo } from './entities/sorteo.entity';
import { Premio } from './entities/premio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sorteo, Premio])
  ],
  controllers: [SorteosController],
  providers: [SorteosService],
})
export class SorteosModule {}

import { Module } from '@nestjs/common';
import { SorteosService } from './sorteos.service';
import { SorteosController } from './sorteos.controller';
import { Sorteo } from './entities/sorteo.entity'
import { TypeOrmModule } from '@nestjs/typeorm';
import { Premio } from './entities/premio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sorteo, Premio])
  ],
  controllers: [SorteosController],
  providers: [SorteosService],
})
export class SorteosModule {}

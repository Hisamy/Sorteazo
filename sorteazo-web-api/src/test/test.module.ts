import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestController } from './test.controller';
import { User } from '../users/entities/user.entity';
import { Organizador } from '../users/entities/organizador.entity';
import { Sorteo } from '../sorteos/entities/sorteo.entity';
import { Boleto } from '../boletos/entities/boleto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organizador, Sorteo, Boleto])],
  controllers: [TestController],
})
export class TestModule {}

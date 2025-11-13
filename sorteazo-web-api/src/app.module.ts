import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmOptions } from './configs/typeorm.config';
import { SorteosModule } from './sorteos/sorteos.module';
import { PagosModule } from './pagos/pagos.module';
import { BoletosModule } from './boletos/boletos.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(TypeOrmOptions),
    UsersModule,
    SorteosModule,
    BoletosModule,
    PagosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

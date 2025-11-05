import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Client } from './entities/client.entity';
import { Organizador } from './entities/organizador.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Client, Organizador])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }

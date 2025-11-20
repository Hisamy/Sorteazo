import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Client } from './entities/client.entity';
import { Organizador } from './entities/organizador.entity';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET_KEY } from '../configs/enviroment.config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Client, Organizador]),
    JwtModule.register({
      secret: JWT_SECRET_KEY,
      signOptions: { expiresIn: '1h' },
    })
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
})
export class UsersModule { }

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

import 'dotenv/config';

console.log('DATABASE_HOST:', process.env.DATABASE_HOST);
console.log('DATABASE_PORT:', process.env.DATABASE_PORT);
console.log('DATABASE_USER:', process.env.DATABASE_USER);
console.log('DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD);
console.log('DATABASE_NAME:', process.env.DATABASE_NAME);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true
  }) ;

  app.use(cookieParser()); ;

  app.useGlobalPipes(new ValidationPipe( { whitelist: true } ))

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

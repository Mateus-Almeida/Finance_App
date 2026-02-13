import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.use(
  //   cors({
  //     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  //     credentials: true,
  //   }),
  // );

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Finance Tracker Backend rodando na porta ${port}`);
  console.log(`📚 Documentação da API: http://localhost:${port}/api`);
}

bootstrap();

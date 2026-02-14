import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

  const config = new DocumentBuilder()
    .setTitle('Finance Tracker API')
    .setDescription('Documentação das rotas do Finance Tracker')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3001;
  const host = process.env.HOST || 'localhost';

  await app.listen(port);

  console.log(`🚀 Finance Tracker Backend rodando em http://${host}:${port}`);
  console.log(`📚 Documentação da API: http://${host}:${port}/api/docs`);
}

bootstrap();

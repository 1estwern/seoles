import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api');
  const origin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
  app.enableCors({
    origin,
    credentials: true,
  });
  const port = Number(process.env.API_PORT ?? 3001);
  await app.listen(port);
  console.log(`API listening on :${port}`);
}

bootstrap();

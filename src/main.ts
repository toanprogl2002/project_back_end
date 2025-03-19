import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ValidationException } from './system/exceptions';
require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  app.enableCors();
  app.use(
    helmet({
      xssFilter: true,
      hidePoweredBy: true,
    }),
  );
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    exceptionFactory: (errors: ValidationError[]) =>
      new ValidationException(null, errors),
  }));
  app.setGlobalPrefix(process.env.API_PREFIX ?? '/api');
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();

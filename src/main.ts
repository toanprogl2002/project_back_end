import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

import { ValidationError, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ValidationException } from './system/exceptions';

import { isProduction } from './utils/env';
import { AppConfig } from './config';
import { LoggerService } from './system/log';
import { TypeORMExceptionFilter } from './system/dbs/exceptions';
import { AllExceptionFilter } from '@system/filters';
import { createSwaggerDocument } from './swagger';
require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    logger: isProduction()
      ? ['log', 'error']
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  //#region INJECT CONFIG
  const _app_config = app.get(AppConfig);
  const _logger = app.get(LoggerService);
  const _http = app.get(HttpAdapterHost);
  //#endregion

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.use(cookieParser());

  app.setGlobalPrefix(process.env.API_PREFIX ?? '/api');

  app.useLogger(_logger);

  app.use(
    helmet({
      xssFilter: true,
      hidePoweredBy: true,
    }),
  );

  app.useBodyParser('json', { limit: '50mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '50mb' });

  app.useGlobalFilters(
    new TypeORMExceptionFilter(_http),
    new AllExceptionFilter(_http),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) =>
        new ValidationException(null, errors),
    }),
  );

  if (_app_config.getApiDocument()) {
    createSwaggerDocument(app);
  }

  const port = _app_config.getPort();
  const host = _app_config.getHost();

  await app.listen(port, host, () => {
    _logger.log(`Application listen in ${port}`, 'Application');
  });
}

void bootstrap();

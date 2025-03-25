import { LoggerService } from './logger.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  providers: [
    LoggerService],
  exports: [LoggerService],
})
export class LoggerModule { }

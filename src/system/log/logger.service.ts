/*
https://docs.nestjs.com/providers#services
*/

import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService extends ConsoleLogger { }

import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
// import { Request } from 'express';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {
		// constructor(private readonly appService: AppService, private readonly request: Request) {
		// console.log(request);
	}
	@Get()
	getHello(): string {
		return this.appService.getHello();
	}
}

import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

import { message } from '@system/validator';

export class FilterRequest {
  @ApiProperty({ required: false })
  @IsString({ message: message.string('Q') })
  @IsOptional()
  q?: string;
}

import { IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

import { message } from '@system/validator';


export class FilterRequest {
  @ApiProperty({ required: false })
  @IsString({ message: message.string('Q') })
  @IsOptional()
  q?: string;
}

export class PaginateFilterRequest extends FilterRequest {
  @ApiProperty({ required: false, default: 1, type: 'number' })
  @Min(1, { message: message.min.number('Page', 1) })
  @IsInt({ message: message.number('Page') })
  @IsOptional()
  @Type(() => Number)
  page = 1;

  @ApiProperty({ required: false, default: 10, type: 'number' })
  @Min(1, { message: message.min.number('Size', 1) })
  @IsInt({ message: message.number('Size') })
  @IsOptional()
  @Type(() => Number)
  size = 10;
}

export class FindAllUserDto extends PaginateFilterRequest {
  @ApiProperty({ required: false, default: 'emails', type: 'string' })
  @IsOptional()
  @IsString()
  email?: string;
}

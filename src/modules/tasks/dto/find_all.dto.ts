// src/modules/tasks/dto/find-all-tasks.dto.ts
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class FindAllTasksDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1, 2]) // 0: not started, 1: in progress, 2: completed
  status?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  size?: number = 10;

  // @IsOptional()
  // @IsString()
  // @IsIn(['name', 'startDate', 'endDate', 'status', 'categoryName'])
  // sortBy?: string = 'startDate';

  // @IsOptional()
  // @IsString()
  // @IsIn(['ASC', 'DESC'])
  // sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

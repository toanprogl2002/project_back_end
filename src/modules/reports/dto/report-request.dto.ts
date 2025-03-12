// src/modules/reports/dto/report-request.dto.ts
import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReportPeriod {
  WEEK = 'week',
  MONTH = 'month',
}

export enum ReportFormat {
  JSON = 'json',
  EXCEL = 'excel',
}
export class ReportRequestDto {
  @IsEnum(ReportPeriod, { message: 'Period must be either "week" or "month"' })
  period: ReportPeriod;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsUUID(undefined, { message: 'User ID must be a valid UUID' })
  userId?: string;

  @IsEnum(ReportFormat, { message: 'Format must be either "json" or "excel"' })
  @IsOptional()
  format?: ReportFormat = ReportFormat.JSON;
}
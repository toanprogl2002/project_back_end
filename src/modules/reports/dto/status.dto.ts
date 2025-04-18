// src/modules/reports/dto/statistics-request.dto.ts
import { IsEnum, IsOptional, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';

export enum StatisticsPeriod {
  DATE = 'date',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  ALL = 'all',
}

export class StatisticsRequestDto {
  @IsEnum(StatisticsPeriod, {
    message: 'Period must be date, week, month, year, or all',
  })
  @IsOptional()
  period: StatisticsPeriod = StatisticsPeriod.MONTH;

  @IsISO8601({}, { message: 'Start date must be a valid ISO 8601 date string' })
  @IsOptional()
  startDate?: string;

  @IsISO8601({}, { message: 'End date must be a valid ISO 8601 date string' })
  @IsOptional()
  endDate?: string;
}

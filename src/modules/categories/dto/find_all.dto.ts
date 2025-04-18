import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindAllCategoryDto {
  @IsOptional()
  @IsNumber()
  page?: number | 1;

  @IsOptional()
  @IsNumber()
  size?: number | 10;

  @IsOptional()
  @IsString()
  name?: string;
}

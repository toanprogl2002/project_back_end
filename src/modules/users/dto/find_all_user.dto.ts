import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindAllUserDto {
  @IsOptional()
  @IsNumber()
  page?: number | 1;

  @IsOptional()
  @IsNumber()
  size?: number | 10;

  @IsOptional()
  @IsString()
  email?: string;
}

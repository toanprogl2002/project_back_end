import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Task name is required' })
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsNotEmpty({ message: 'Start date is required' })
  start_date: string;

  @IsString()
  @IsNotEmpty({ message: 'End date is required' })
  end_date: string;

  @IsUUID()
  @IsNotEmpty({ message: 'Category ID is required' })
  category_id: string;

  @IsString()
  @IsOptional()
  completed_date?: string;
}

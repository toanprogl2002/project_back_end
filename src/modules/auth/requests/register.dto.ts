import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ type: 'string', required: true })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ type: 'string', required: true })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ type: 'string', required: true })
  @IsNotEmpty()
  @IsString()
  name: string;
}

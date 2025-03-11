// src/modules/users/dto/update-role.dto.ts
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateRoleDto {
  @IsNotEmpty({ message: 'id is required' })
  @IsUUID()
  id: string

  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(['user', 'admin'], { message: 'Role must be either "user" or "admin"' })
  role: 'user' | 'admin';
}
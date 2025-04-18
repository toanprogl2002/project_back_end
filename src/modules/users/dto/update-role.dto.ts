// src/modules/users/dto/update-role.dto.ts
import { ROLE_TYPE_ENUM } from '@/constants/enums';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateRoleDto {
  @IsNotEmpty({ message: 'id is required' })
  @IsUUID()
  id: string;

  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(ROLE_TYPE_ENUM, { message: 'Role must be either "user" or "admin"' })
  role: ROLE_TYPE_ENUM;
}

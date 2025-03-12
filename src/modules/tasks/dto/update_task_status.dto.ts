// src/modules/tasks/dto/update-task-status.dto.ts
import { IsIn, IsInt, IsOptional } from 'class-validator';

export class UpdateTaskStatusDto {
  @IsInt({ message: 'Trạng thái phải là số nguyên' })
  @IsIn([0, 1, 2], {
    message:
      'Trạng thái phải là 0 (chưa hoàn thành), 1 (đang thực hiện) hoặc 2 (đã hoàn thành)',
  })
  status: number;

  @IsOptional()
  note?: string; // Optional note for status changes
}

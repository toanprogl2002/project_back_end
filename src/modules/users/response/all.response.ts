import { User } from "@/database/entities";
import { LengthAwarePaginator } from "@/system/dbs";
import { DataPaginatedResponse } from "@/system/response";
import { Expose, plainToInstance } from "class-transformer";

export class PaginatedData {
  @Expose()
  id: string;
  @Expose()
  email: string;
  @Expose()
  role: string;
  @Expose()
  status: number;
  @Expose()
  created_at: Date;
  @Expose()
  updated_at: Date;
  @Expose()
  deleted_at: Date | null;
}


export class PaginatedResponseListUsers extends DataPaginatedResponse<PaginatedData> {
  constructor({ items, ...response }: LengthAwarePaginator<User>) {
    super({
      ...response,
      items: plainToInstance(PaginatedData, items, {
        excludeExtraneousValues: true,
      }),
    });
  }
}
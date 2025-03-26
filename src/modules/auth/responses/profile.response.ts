import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToClass, Transform } from 'class-transformer';

import { ROLE_TYPE_ENUM } from '@/constants';
import { User } from '@/database/entities';
import { DataResponse } from '@/system/response';

export class Profile {
  @ApiProperty({ type: 'string' })
  @Transform(({ obj }: { obj: User }) => obj.id)
  @Expose()
  id: string;

  @ApiProperty({ type: 'string' })
  @Transform(({ obj }: { obj: User }) => obj.name)
  @Expose()
  name: string;

  @ApiProperty({ type: 'string' })
  @Transform(({ obj }: { obj: User }) => obj.email)
  @Expose()
  email: string;

  @ApiProperty({ type: 'string', enum: ROLE_TYPE_ENUM })
  @Transform(({ obj }: { obj: User }) => obj.role)
  @Expose()
  role: ROLE_TYPE_ENUM;
}

export class ProfileResponse extends DataResponse<Profile> {
  constructor(user: User) {
    super(plainToClass(Profile, user, { excludeExtraneousValues: true }));
  }
}

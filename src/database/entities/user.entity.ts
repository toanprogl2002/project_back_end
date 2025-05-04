import {
  Column,
  Entity, OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation
} from 'typeorm';

import { Category } from './category.entity';
// import { RefreshToken } from './refresh_token.entity';
import { ROLE_TYPE_ENUM } from '@/constants/enums/';
import { BaseEntity } from './base.entity';
import { Session } from './session.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'user', enum: ROLE_TYPE_ENUM })
  role: 'admin' | 'user';

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ type: 'int', enum: [0, 1], default: 1 })
  status: number;

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  // In user.entity.ts
  // @OneToOne(() => Session, session => session.user)
  // sessions: Session[];
  @OneToOne(() => Session, (session) => session.user)
  session!: Relation<Session>;
}

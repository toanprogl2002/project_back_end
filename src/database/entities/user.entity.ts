import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Category } from './category.entity';
// import { RefreshToken } from './refresh_token.entity';
import { ROLE_TYPE_ENUM } from '@/constants/enums/';
import { Session } from './session.entity';

@Entity('users')
export class User {
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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy: string;

  @Column({ type: 'timestamp', nullable: true, name: 'modified_date' })
  modifiedDate: Date;

  @Column({ type: 'uuid', nullable: true, name: 'modified_by' })
  modifiedBy: string;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_date' })
  deletedDate: Date;

  @Column({ type: 'uuid', nullable: true, name: 'deleted_by' })
  deletedBy: string;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  // @OneToMany(() => Session, session => session.user)
  // sessions: Session[];
}

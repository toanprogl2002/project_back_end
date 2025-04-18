import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { Task } from './task.entity';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @ManyToOne(() => User, (user) => user.categories)
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ type: 'int', default: 0 })
  status: number;

  @OneToMany(() => Task, (task) => task.category)
  tasks: Task[];
}

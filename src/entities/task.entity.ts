import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from './category.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  slug: string;

  @Column({ type: 'uuid', name: 'category_id' })
  category_id: string;

  @ManyToOne(() => Category, (category) => category.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_date: Date;

  @Column({ type: 'int', default: 0 })
  status: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_date: Date;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  created_by: string;

  @Column({ type: 'timestamp', nullable: true, name: 'modified_date' })
  modified_date: Date;

  @Column({ type: 'uuid', nullable: true, name: 'modified_by' })
  modified_by: string;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_date' })
  deleted_date: Date;

  @Column({ type: 'uuid', nullable: true, name: 'deleted_by' })
  deleted_by: string;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;
}
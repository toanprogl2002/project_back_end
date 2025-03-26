import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';

import { Task } from './task.entity';
import { User } from './user.entity';

@Entity('categories')
export class Category {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ length: 255 })
	name: string;

	@Column({ type: 'uuid', name: 'user_id' })
	userId: string;

	@Column({ length: 255, unique: true })
	slug: string;

	@ManyToOne(() => User, (user) => user.categories, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user_id' })
	user: User;

	@Column({ type: 'int', default: 0 })
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

	@OneToMany(() => Task, (task) => task.category)
	tasks: Task[];
}

// import {
// 	Column,
// 	CreateDateColumn,
// 	Entity,
// 	JoinColumn,
// 	OneToOne,
// 	PrimaryGeneratedColumn,
// } from 'typeorm';

// import { User } from './user.entity';

// @Entity('refreshtokens')
// export class RefreshToken {
// 	@PrimaryGeneratedColumn('uuid')
// 	id: string;

// 	@Column({ name: 'token', unique: true })
// 	token: string;

// 	@Column({ name: 'user_id', type: 'uuid' })
// 	userId: string;

// 	@OneToOne(() => User, { onDelete: 'CASCADE' })
// 	@JoinColumn({ name: 'user_id' })
// 	user: User;

// 	@Column({ name: 'expires_at' })
// 	expiresAt: Date;

// 	@CreateDateColumn({ name: 'created_at' })
// 	createdAt: Date;
// }

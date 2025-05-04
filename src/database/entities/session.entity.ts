import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { User } from './user.entity';


@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: false })
  user_id!: string;

  @Column({ type: 'text', name: 'access_token', nullable: false })
  access_token!: string;

  @Column({ type: 'text', name: 'refresh_token', nullable: false })
  refresh_token!: string;

  @CreateDateColumn({ name: 'login_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  login_at!: Date;

  @Column({ type: 'timestamp', name: 'logout_at', nullable: true })
  logout_at: Date | null;
  //#endregion

  // //#region RELATIONS
  @OneToOne(() => User, user => user.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user!: Relation<User>;
}

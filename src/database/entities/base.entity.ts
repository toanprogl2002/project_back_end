import { Column } from "typeorm";

export class BaseEntity {
  @Column({ type: 'timestamp', name: 'create_date', default: () => 'CURRENT_TIMESTAMP' })
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
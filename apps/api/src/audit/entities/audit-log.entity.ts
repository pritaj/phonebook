import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  action: string;

  @Column()
  entityType: string;

  @Column({ type: 'int', nullable: true })
  entityId: number | null;

  @Column({ type: 'varchar', nullable: true })
  details: string | null;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}

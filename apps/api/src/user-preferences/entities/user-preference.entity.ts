import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class UserPreference {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int', unique: true })
  userId: number;

  @Column({ type: 'varchar', length: 10, default: 'hu-HU' })
  language: string;

  @UpdateDateColumn()
  updatedAt: Date;
}

import { Department } from "../../departments/entities/department.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lastName: string;

  @Column()
  firstName: string;

  @ManyToOne(() => Department)
  @JoinColumn({name: 'departmentId'})
  department: Department;

  @Column({type: 'int'})
  departmentId: number;

  @Column({type: 'varchar', nullable: true})
  phone: string | null;

  @Column({type: 'varchar', nullable: true})
  email: string | null;

  @Column({type: 'varchar', nullable: true})
  position: string | null;
}

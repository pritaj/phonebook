import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  id:number;

  @Column()
  nameHu: string;

  @Column({type: 'varchar', nullable:true})
  nameEn: string | null;
  
  @ManyToOne(() => Department, {nullable:true})
  @JoinColumn({name: 'parentId'})
  parent: Department | null;

  @Column({type: 'int', nullable: true})
  parentId: number | null;

  @OneToMany(() => Department, (department) => department.parent)
  children: Department[];
}

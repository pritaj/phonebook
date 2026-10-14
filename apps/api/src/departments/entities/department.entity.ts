import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  id:number;

  @Column() 
  nameHu: string;

  @Column({type: 'varchar', nullable:true}) 
  nameEn: string | null;

  @ManyToOne(() => Department, {nullable:true})
  parent: Department | null;

  @OneToMany(() => Department, (department) => department.parent)
  children: Department[];
  
}

import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  id:number;

  @Column() 
  nameHu: string;

  @Column({type: 'varchar', nullable:true}) 
  nameEn: string | null;
}

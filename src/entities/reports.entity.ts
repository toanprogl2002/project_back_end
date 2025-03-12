// import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
// import { Category } from "./category.entity";




// @Entity('reports')
// export class Report {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column()
//   title: string;

//   @Column()
//   description: string;

//   @Column()
//   userId: string;

//   @Column()
//   status: number;

//   @Column()
//   startDate: Date;

//   @Column()
//   endDate: Date;

//   @Column()
//   completedDate: Date;

//   @Column()
//   categoryId: string;

//   // @ManyToOne(() => Category, category => category.reports)
//   // category: Category;

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;
// }
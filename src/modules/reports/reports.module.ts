import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/entities/task.entity';
import { Category } from 'src/entities/category.entity';
import { User } from 'src/entities/user.entity';
import e from 'express';
import { ExcelService } from './excel.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Category, User])
  ],
  providers: [ReportsService,
    ExcelService],
  controllers: [ReportsController],
  exports: [ReportsService]
})
export class ReportsModule { }

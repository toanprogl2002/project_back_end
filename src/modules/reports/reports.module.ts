import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '@/database/entities/task.entity';
import { Category } from '@/database/entities/category.entity';
import { User } from '@/database/entities/user.entity';
import e from 'express';
import { ExcelService } from './excel.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Category, User])],
  providers: [ReportsService, ExcelService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}

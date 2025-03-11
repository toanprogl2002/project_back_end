// src/modules/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { Category } from '../../entities/category.entity';
import { User } from '../../entities/user.entity';
import { ReportPeriod } from './dto/report-request.dto';
// import { ReportPeriod } from './dto/report-request.dto';
// import { ExcelService } from '../shared/services/excel.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    // private excelService: ExcelService,
  ) { }
  private getStatusLabel(status: number): string {
    switch (status) {
      case 0:
        return 'Chưa bắt đầu';
      case 1:
        return 'Đang thực hiện';
      case 2:
        return 'Đã hoàn thành';
      default:
        return 'Không xác định';
    }
  }

  async getTaskReport(period: ReportPeriod, startDate?: string, userId?: string): Promise<any> {
    // Calculate the date range based on period
    const { start, end } = this.calculateDateRange(period, startDate);

    // Build query
    const query = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.category', 'category')
      .where('task.deleted = :deleted', { deleted: false })
      .andWhere('task.start_date >= :startDate', { startDate: start })
      .andWhere('task.start_date <= :endDate', { endDate: end });

    // Filter by user if provided
    if (userId) {
      query.andWhere('task.userId = :userId', { userId });
    }

    // Get tasks
    const tasks = await query
      .orderBy('task.start_date', 'ASC')
      .addOrderBy('category.name', 'ASC')
      .getMany();

    // Calculate metrics for the report
    const completedTasks = tasks.filter(task => task.status === 2).length;
    const onTimeTasks = tasks.filter(task =>
      task.status === 2 &&
      task.completed_date &&
      task.end_date &&
      new Date(task.completed_date) <= new Date(task.end_date)
    ).length;
    const overdueTasks = tasks.filter(task =>
      task.status !== 2 &&
      task.end_date &&
      new Date(task.end_date) < new Date()
    ).length;

    // Format the tasks for the response
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      name: task.name,
      category: {
        id: task.category?.id,
        name: task.category?.name
      },
      startDate: task.start_date,
      endDate: task.end_date,
      completedDate: task.completed_date,
      status: task.status,
      statusLabel: this.getStatusLabel(task.status),
      onTime: task.status === 2 && task.completed_date && task.end_date ?
        new Date(task.completed_date) <= new Date(task.end_date) : null,
      daysToComplete: task.completed_date && task.start_date ?
        Math.ceil((new Date(task.completed_date).getTime() - new Date(task.start_date).getTime()) / (1000 * 60 * 60 * 24)) : null,
      plannedDays: task.end_date && task.start_date ?
        Math.ceil((new Date(task.end_date).getTime() - new Date(task.start_date).getTime()) / (1000 * 60 * 60 * 24)) : null
    }));

    // Return the report data
    return {
      data: {
        period: period,
        startDate: start,
        endDate: end,
        tasks: formattedTasks,
        summary: {
          totalTasks: tasks.length,
          completedTasks,
          onTimeTasks,
          overdueTasks,
          completionRate: tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0,
          onTimeRate: completedTasks > 0 ? (onTimeTasks / completedTasks) * 100 : 0
        }
      },
      message: `Báo cáo công việc ${period === ReportPeriod.WEEK ? 'tuần' : 'tháng'} thành công`,
      status: true
    };
  }

  // async generateExcelReport(period: ReportPeriod, startDate?: string, userId?: string): Promise<Buffer> {
  //   const report = await this.getTaskReport(period, startDate, userId);
  //   return this.excelService.generateTaskReport(
  //     report.data.tasks,
  //     period,
  //     report.data.startDate
  //   );
  // }

  private calculateDateRange(period: ReportPeriod, customStartDate?: string): { start: Date, end: Date } {
    let start = customStartDate ? new Date(customStartDate) : new Date();
    let end = new Date(start);

    // Reset to start of day
    start.setHours(0, 0, 0, 0);

    // If no custom date, adjust to start of current week/month
    if (!customStartDate) {
      if (period === ReportPeriod.WEEK) {
        // Get to the start of the week (Sunday = 0, Monday = 1, etc.)
        const day = start.getDay();
        start.setDate(start.getDate() - day); // Go back to Sunday
      } else {
        // Get to the start of the month
        start.setDate(1);
      }
    }

    // Calculate end date based on period
    if (period === ReportPeriod.WEEK) {
      // End of week (start + 6 days)
      end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      // End of month
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    return { start, end };
  }

  //   // Calculate end date based on period
  //   if (period === ReportPeriod.WEEK) {
  //     // End of week (start + 6 days)
  //     end = new Date(start);
  //     end.setDate(end.getDate() + 6);
  //     end.setHours(23, 59, 59, 999);
  //   } else {
  //     // End of month
  //     end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
  //   }

  //   return { start, end };
  // }


}
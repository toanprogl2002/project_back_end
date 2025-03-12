// src/modules/reports/reports.service.ts
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { Category } from '../../entities/category.entity';
import { User } from '../../entities/user.entity';
import { ReportPeriod } from './dto/report-request.dto';
import { ExcelService } from './excel.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    // @InjectRepository(Category)
    // private categoryRepository: Repository<Category>,
    // @Inject(forwardRef(() => ExcelService))
    private readonly excelService: ExcelService
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

  async generateExcelReport(period: ReportPeriod, startDate?: string, userId?: string): Promise<Buffer> {
    const report = await this.getTaskReport(period, startDate, userId);
    // console.log('ExcelService instance:', this.excelService);
    // console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.excelService)));

    return this.excelService.generateTaskReport(
      report.data.tasks,
      period,
      report.data.startDate
    );
  }

  async getTaskReport(period: ReportPeriod, startDate?: string, userId?: string): Promise<any> {
    // Kiểm tra userId hợp lệ
    const user = await this.userRepository.findOne({ where: { id: userId, deleted: false } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Tính toán khoảng thời gian
    const { start, end } = this.calculateDateRange(period, startDate);

    // Xây dựng truy vấn
    const query = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.category', 'category')
      .where('task.deleted = :deleted', { deleted: false })
      .andWhere('task.start_date >= :startDate', { startDate: start })
      .andWhere('task.start_date <= :endDate', { endDate: end });

    // Lọc nhiệm vụ theo vai trò người dùng
    if (user.role !== 'admin') {
      query.andWhere('category.user_id = :userId', { userId });
    }

    // Lấy danh sách nhiệm vụ
    const tasks = await query
      .orderBy('task.start_date', 'ASC')
      .addOrderBy('category.name', 'ASC')
      .getMany();

    // Tính toán thống kê
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

    // Định dạng nhiệm vụ
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

    // Trả về báo cáo
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
          completionRate: tasks.length > 0 ? parseFloat((completedTasks / tasks.length).toFixed(2)) * 100 : 0,
          onTimeRate: completedTasks > 0 ? parseFloat((completedTasks / tasks.length).toFixed(2)) * 100 : 0
        }
      },
      message: `Báo cáo công việc ${period === ReportPeriod.WEEK ? 'tuần' : 'tháng'} thành công`,
      status: true
    };
  }

  private calculateDateRange(period: ReportPeriod, customStartDate?: string): { start: Date, end: Date } {
    let start = customStartDate ? new Date(customStartDate) : new Date();
    let end = new Date(start);

    // Reset to start of day
    start.setHours(0, 0, 0, 0);

    if (!customStartDate) {
      if (period === ReportPeriod.WEEK) {
        const day = start.getDay();
        start.setDate(start.getDate() - day); // Go back to Sunday
      } else {
        start.setDate(1);
      }
    }
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

}
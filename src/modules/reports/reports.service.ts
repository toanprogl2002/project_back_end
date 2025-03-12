// src/modules/reports/reports.service.ts
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { Category } from '../../entities/category.entity';
import { User } from '../../entities/user.entity';
import { ReportPeriod } from './dto/report-request.dto';
import { ExcelService } from './excel.service';
import { StatisticsPeriod } from './dto/status.dto';

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

  // src/modules/reports/reports.service.ts
  // Add this method to your existing ReportsService class

  async getAdminStatistics(period: StatisticsPeriod, startDate?: string, endDate?: string): Promise<any> {

    // Calculate date range based on period
    const dateRange = this.calculateStatisticsDateRange(period, startDate, endDate);

    // Get all tasks within the date range
    const tasks = await this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.category', 'category')
      .leftJoinAndSelect('category.user', 'user')
      .where('task.deleted = :deleted', { deleted: false })
      .andWhere('task.start_date >= :startDate', { startDate: dateRange.start })
      .andWhere('task.start_date <= :endDate', { endDate: dateRange.end })
      .getMany();

    // Get all users
    const users = await this.userRepository.find({
      where: { deleted: false },
      select: ['id', 'email', 'name', 'role', 'status']
    });

    // Get tasks per user
    const tasksByUser = {};
    users.forEach(user => {
      tasksByUser[user.id] = {
        user: {
          id: user.id,
          email: user.email,
          name: `${user.name || ''}`.trim(),
          role: user.role,
          status: user.status
        },
        tasks: [],
        totalTasks: 0,
        completedTasks: 0,
        onTimeTasks: 0,
        overdueTasks: 0,
        completionRate: 0,
        onTimeRate: 0
      };
    });

    // Assign tasks to users
    tasks.forEach(task => {
      const userId = task.category?.user?.id;
      if (userId && tasksByUser[userId]) {
        tasksByUser[userId].tasks.push(task);
        tasksByUser[userId].totalTasks++;

        if (task.status === 2) {
          tasksByUser[userId].completedTasks++;

          // Check if completed on time
          if (task.completed_date && task.end_date &&
            new Date(task.completed_date) <= new Date(task.end_date)) {
            tasksByUser[userId].onTimeTasks++;
          }
        }

        // Check if overdue
        if (task.status !== 2 && task.end_date && new Date(task.end_date) < new Date()) {
          tasksByUser[userId].overdueTasks++;
        }
      }
    });

    // Calculate percentages
    Object.values(tasksByUser).forEach((userData: any) => {
      userData.completionRate = userData.totalTasks > 0 ?
        parseFloat((userData.completedTasks / userData.totalTasks).toFixed(2)) * 100 : 0;

      userData.onTimeRate = userData.completedTasks > 0 ?
        parseFloat((userData.onTimeTasks / userData.completedTasks).toFixed(2)) * 100 : 0;

      // Remove the actual task objects to keep the response size manageable
      delete userData.tasks;
    });

    // Get task counts by status
    const tasksByStatus = {
      notStarted: tasks.filter(t => t.status === 0).length,
      inProgress: tasks.filter(t => t.status === 1).length,
      completed: tasks.filter(t => t.status === 2).length
    };

    // Get task counts by category
    const tasksByCategory = {};
    tasks.forEach(task => {
      const categoryId = task.category?.id;
      const categoryName = task.category?.name || 'None categorized';

      if (!tasksByCategory[categoryId]) {
        tasksByCategory[categoryId] = {
          id: categoryId,
          name: categoryName,
          count: 0,
          completed: 0,
          completion_rate: 0
        };
      }

      tasksByCategory[categoryId].count++;
      if (task.status === 2) {
        tasksByCategory[categoryId].completed++;
      }
    });

    // Calculate category completion rates
    Object.values(tasksByCategory).forEach((catData: any) => {
      catData.completion_rate = catData.count > 0 ?
        parseFloat((catData.completed / catData.count).toFixed(2)) * 100 : 0;
    });

    // Calculate time-based metrics
    // const timeMetrics = {
    //   averageCompletionDays: 0,
    //   tasksCompletedThisWeek: 0,
    //   tasksCompletedThisMonth: 0,
    //   tasksAddedThisWeek: 0,
    //   tasksAddedThisMonth: 0
    // };

    // Calculate average completion time
    // const completedTasks = tasks.filter(task =>
    //   task.status === 2 && task.completed_date && task.start_date
    // );

    // if (completedTasks.length > 0) {
    //   const totalDays = completedTasks.reduce((sum, task) => {
    //     const days = Math.ceil((new Date().getTime() - new Date(task.start_date).getTime())
    //       / (1000 * 60 * 60 * 24));
    //     return sum + days;
    //   }, 0);

    //   timeMetrics.averageCompletionDays = parseFloat((totalDays / completedTasks.length).toFixed(1));
    // }

    // Get this week's and month's dates for comparison
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Count tasks completed and added recently
    // tasks.forEach(task => {
    //   // Check tasks completed this week/month
    //   if (task.status === 2 && task.completed_date) {
    //     const completedDate = new Date(task.completed_date);
    //     if (completedDate >= startOfWeek) {
    //       timeMetrics.tasksCompletedThisWeek++;
    //     }
    //     if (completedDate >= startOfMonth) {
    //       timeMetrics.tasksCompletedThisMonth++;
    //     }
    //   }

    //   // Check tasks created this week/month
    //   const createdDate = task.created_date ? new Date(task.created_date) : null;
    //   if (createdDate) {
    //     if (createdDate >= startOfWeek) {
    //       timeMetrics.tasksAddedThisWeek++;
    //     }
    //     if (createdDate >= startOfMonth) {
    //       timeMetrics.tasksAddedThisMonth++;
    //     }
    //   }
    // });

    // Compile all statistics
    return {
      data: {
        period,
        dateRange: {
          start: dateRange.start,
          end: dateRange.end
        },
        overview: {
          totalUsers: users.length,
          activeUsers: users.filter(u => u.status === 1).length,
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 2).length,
          overdueTasks: tasks.filter(t => t.status !== 2 && t.end_date && new Date(t.end_date) < new Date()).length,
          completionRate: tasks.length > 0 ?
            parseFloat((tasks.filter(t => t.status === 2).length / tasks.length).toFixed(2)) * 100 : 0
        },
        userStatistics: Object.values(tasksByUser),
        taskDistribution: {
          byStatus: tasksByStatus,
          byCategory: Object.values(tasksByCategory)
        },
        // timeMetrics
      },
      message: 'Thống kê công việc thành công',
      status: true
    };
  }

  private calculateStatisticsDateRange(
    period: StatisticsPeriod,
    customStartDate?: string,
    customEndDate?: string
  ): { start: Date, end: Date } {
    // If custom dates are provided, use them
    if (customStartDate && customEndDate) {
      return {
        start: new Date(customStartDate),
        end: new Date(customEndDate)
      };
    }

    let start = new Date();
    let end = new Date();

    // Reset to start of day
    start.setHours(0, 0, 0, 0);

    switch (period) {
      case StatisticsPeriod.DATE:
        end.setHours(23, 59, 59, 999);
        break;
      case StatisticsPeriod.WEEK:
        // Get start of week (Sunday)
        start = new Date(start);
        start.setDate(start.getDate() - start.getDay());

        // End of week (Saturday)
        end = new Date(start);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;

      case StatisticsPeriod.MONTH:
        // Start of month
        start = new Date(start.getFullYear(), start.getMonth(), 1);

        // End of month
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
        break;

      case StatisticsPeriod.YEAR:
        // Start of year
        start = new Date(start.getFullYear(), 0, 1);

        // End of year
        end = new Date(start.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;

      case StatisticsPeriod.ALL:
        // All time - use a very old start date and current date as end
        start = new Date(2000, 0, 1);
        break;
    }

    return { start, end };
  }
}
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/entities/task.entity';
import { Repository } from 'typeorm';

import { CreateTaskDto } from './dto/create-task.dto';
import { FindAllTasksDto } from './dto/find_all.dto';
import { UpdateTaskStatusDto } from './dto/update_task_status.dto';
import { generateSlug } from 'src/utils/generate_slug';
import { Category } from 'src/entities/category.entity';
import { CategoriesService } from '../categories/categories.service';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    // private categoriesService: CategoriesService,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,

    // @InjectRepository(Category)
    @Inject(forwardRef(() => CategoriesService))
    private categoryService: CategoriesService,
  ) { }

  private getStatusLabel(status: number): string {
    switch (status) {
      case 0:
        return 'Chưa hoàn thành';
      case 1:
        return 'Đang thực hiện';
      case 2:
        return 'Đã hoàn thành';
      default:
        return 'Không xác định';
    }
  }
  async getAllTasks(findAllTasksDto: FindAllTasksDto) {
    const page = findAllTasksDto.page || 1;
    const size = findAllTasksDto.size || 10;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.category', 'category')
      .where('task.deleted  = :deleted', { deleted: false });
    // Filter by user if provided
    // if (userId) {
    //   queryBuilder.andWhere('task.userId = :userId', { userId });
    // }

    // Apply filters
    // if (name) {
    //   queryBuilder.andWhere('task.name LIKE :name', { name: `%${name}%` });
    // }

    // if (categoryId) {
    //   queryBuilder.andWhere('task.category_id = :categoryId', { categoryId });
    // }

    // if (startDate) {
    //   queryBuilder.andWhere('task.start_date >= :startDate', { startDate });
    // }

    // if (endDate) {
    //   queryBuilder.andWhere('task.end_date <= :endDate', { endDate });
    // }

    // if (status !== undefined) {
    //   queryBuilder.andWhere('task.status = :status', { status });
    // }

    // Apply sorting
    // const sortingMap = {
    //   name: 'task.name',
    //   startDate: 'task.start_date',
    //   endDate: 'task.end_date',
    //   status: 'task.status',
    //   categoryName: 'category.name'
    // };

    // const sortColumn = sortingMap[sortBy] || 'task.start_date';
    // queryBuilder.orderBy(sortColumn, sortOrder);

    // Add secondary sorting for consistent pagination
    // if (sortColumn !== 'task.name') {
    //   queryBuilder.addOrderBy('task.name', 'ASC');
    // }

    // Execute the query with pagination
    const [tasks, total] = await queryBuilder
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    // Calculate pagination metadata
    const lastPage = Math.ceil(total / size);
    const hasNextPage = page < lastPage;

    // Transform for response
    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      name: task.name,
      category: {
        id: task.category.id,
        name: task.category.name,
      },
      startDate: task.start_date,
      endDate: task.end_date,
      completedDate: task.completed_date,
      status: task.status,
      statusLabel: this.getStatusLabel(task.status),
    }));

    return {
      data: formattedTasks,
      metadata: {
        page,
        size,
        next: hasNextPage,
        total,
        last_page: lastPage,
      },
      message: 'Lấy danh sách công việc thành công',
      status: true,
    };
  }

  async getOneTask(id: string) {
    const task = await this.taskRepository.findOne({
      where: { id, deleted: false },
      // relations: ['category']
    });

    if (!task) {
      throw new NotFoundException('Công việc không tồn tại');
    }

    return {
      data: task,
      message: 'Lấy thông tin công việc thành công',
      status: true,
    };
  }

  async updateTaskStatus(taskId: string, statusDto: UpdateTaskStatusDto) {
    // Find the task
    const task = await this.taskRepository.findOne({
      where: { id: taskId, deleted: false },
      // relations: ['category']
    });

    if (!task) {
      throw new NotFoundException('Công việc không tồn tại');
    }

    // Optional: Check authorization
    // if (task.userId !== userId) {
    //   throw new UnauthorizedException('Bạn không có quyền cập nhật công việc này');
    // }

    // Store the original status for comparison
    const originalStatus = task.status;

    // Update the status
    task.status = statusDto.status;

    // Handle completed status
    if (statusDto.status === 2 && originalStatus !== 2) {
      task.completed_date = new Date();
    } else if (statusDto.status !== 2 && originalStatus === 2) {
      task.completed_date = null;
    }

    // Update modified information
    // task.modifiedBy = userId;
    task.modified_date = new Date();

    await this.taskRepository.save(task);

    return {
      // data: {
      //   id: task.id,
      //   name: task.name,
      //   category: {
      //     id: task.category.id,
      //     name: task.category.name
      //   },
      //   startDate: task.start_date,
      //   endDate: task.end_date,
      //   completedDate: task.completed_date,
      //   status: task.status,
      //   statusLabel: this.getStatusLabel(task.status)
      // },
      message: `Cập nhật trạng thái công việc thành ${this.getStatusLabel(task.status)}`,
      status: true,
    };
  }

  async createTask(createTaskDto: CreateTaskDto) {
    const slug = createTaskDto.slug || generateSlug(createTaskDto.name);

    // Check if the category exists and belongs to the user
    const category = await this.categoryService.findOne(
      createTaskDto.category_id
    );
    if (!category) {
      throw new NotFoundException('Danh mục không tồn tại');
    }

    const task = this.taskRepository.create({
      name: createTaskDto.name,
      slug: slug,
      category_id: createTaskDto.category_id,
      start_date: new Date(createTaskDto.start_date) || null,
      end_date: new Date(createTaskDto.end_date) || null,
      status: 0,
      created_date: new Date(),
      deleted: false
    });
    // console.log(t)
    // Create a new task entity
    // const task = this.taskRepository.create({
    //   // name_task: createTaskDto.name,
    //   slug: slug,
    //   category_id: createTaskDto.category_id,
    //   // Convert string dates to Date objects
    //   start_date: createTaskDto.start_date ? new Date(createTaskDto.start_date) : null,
    //   end_date: createTaskDto.end_date ? new Date(createTaskDto.end_date) : null,
    //   // completed_date: createTaskDto.completed_date ? new Date(createTaskDto.completed_date) : null,
    //   status: 0, // Set status based on completion
    //   createdDate: new Date()
    // });

    // Save the task
    await this.taskRepository.save(task);

    return {
      data: task,
      message: 'Tạo công việc thành công',
      status: true
    };
  }

  async updateTask(taskId: string, updateTaskDto: UpdateTaskDto) {

    const task = await this.taskRepository.findOne({
      where: { id: taskId, deleted: false },
      // relations: ['category']
    });

    if (!task) {
      throw new NotFoundException('Công việc không tồn tại');
    }

    const updateData = {
      ...updateTaskDto,
      modified_date: new Date(),
      end_date: updateTaskDto.end_date ? new Date(updateTaskDto.end_date) : undefined,
    };

    if (updateTaskDto.name && !updateTaskDto.slug) {
      updateData.slug = generateSlug(updateTaskDto.name);
    }

    await this.taskRepository.update(taskId, updateData);

    const updatedTask = await this.taskRepository.findOne({
      where: { id: taskId },
      // relations: ['category']
    });

    return {
      data: updatedTask,
      message: 'Cập nhật công việc thành công',
      status: true
    };
  }

  async deleteTask(taskId: string) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId, deleted: false },
      // relations: ['category']
    });

    if (!task) {
      throw new NotFoundException('Công việc không tồn tại');
    }

    task.deleted = true;
    task.deleted_date = new Date();

    await this.taskRepository.save(task);

    return {
      // data: ""task.deleted,
      message: 'Xóa công việc thành công',
      status: true
    };
  }


}

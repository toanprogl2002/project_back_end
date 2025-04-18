import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { RequestWithUser } from '../categories/requestPost';

import { FindAllTasksDto } from './dto/find_all.dto';
import { UpdateTaskStatusDto } from './dto/update_task_status.dto';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllTasks(
    @Query(ValidationPipe) query: FindAllTasksDto,
    @Req() req: RequestWithUser,
  ) {
    // Get user ID from JWT token
    // const userId = req.user.userId;

    // // For admin users, you might not filter by userId
    // if (req.user.role === 'admin' && query.userId) {
    //   return this.tasksService.getAllTasks(query, query.userId);
    // }

    // For regular users, always filter by their own userId
    return this.tasksService.getAllTasks(query);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getOneTask(@Req() req: RequestWithUser) {
    // Get user ID from JWT token
    const userId = req.user.userId;

    return this.tasksService.getOneTask(userId);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'))
  async updateTaskStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) statusDto: UpdateTaskStatusDto,
    // @Req() req: RequestWithUser
  ) {
    // const userId = req.user.userId;
    return this.tasksService.updateTaskStatus(id, statusDto);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createTask(
    @Body(new ValidationPipe({ transform: true })) createTaskDto: CreateTaskDto,
    // @Req() req: RequestWithUser,
  ) {
    // const userId = req.user.userId;
    return this.tasksService.createTask(createTaskDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ transform: true })) updateTaskDto: UpdateTaskDto,
    // @Req() req: RequestWithUser,
  ) {
    // const userId = req.user.userId;
    try {
      return this.tasksService.updateTask(id, updateTaskDto);
    } catch (error) {
      throw new NotFoundException('Task not found');
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteTask(
    @Param('id', ParseUUIDPipe) id: string,
    // @Req() req: RequestWithUser,
  ) {
    // const userId = req.user.userId;
    try {
      return this.tasksService.deleteTask(id);
    } catch (error) {
      throw new NotFoundException('Task not found');
    }
  }
}

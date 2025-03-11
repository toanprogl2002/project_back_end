import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { FindAllUserDto } from './dto/find_all_user.dto';
import { UsersService } from './users.service';
// import { RequestWithUser } from '../auth/auth';
import { ResetPassDto } from './dto/reset_pass.dto';
import { RoleGuard } from './role.guard';
import { User } from './user.interface';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RequestWithUser } from '../categories/requestPost';
@Controller('users')
// @UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  // @UseGuards(RoleGuard)
  async findAll(@Query(ValidationPipe) findAllUserDto: FindAllUserDto) {
    return this.usersService.findAll(findAllUserDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  // @UseGuards(RoleGuard)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  // src/modules/users/users.controller.ts

  @Get(':id/categories-tasks')
  @UseGuards(AuthGuard('jwt'))
  async getUserWithCategoriesAndTasks(
    @Param('id', ParseUUIDPipe) id: string,
    // @Req() req: RequestWithUser
  ) {
    // Check if user is requesting their own data or is an admin
    // if (req.user.userId !== id && req.user.role !== 'admin') {
    //   throw new ForbiddenException('Bạn không có quyền truy cập dữ liệu này');
    // }

    return this.usersService.getUserWithCategoriesAndTasks(id);
  }

  @Post(':id/reset-password')
  @UseGuards(AuthGuard('jwt'))
  // @UseGuards(RoleGuard)
  async resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) resetPassDto: ResetPassDto,
    // @Req () req : RequestWithUser
  ): Promise<any> {
    return this.usersService.resetPassword(id, resetPassDto);
  }

  @Patch(':id/disable')
  // @UseGuards(RoleGuard)
  @UseGuards(AuthGuard('jwt'))
  async disableAccount(@Param('id') id: string) {
    return this.usersService.disableAccount(id);
  }

  @Patch('role')
  // @UseGuards(RoleGuard)
  @UseGuards(AuthGuard('jwt'))
  async updateRole(
    @Body(ValidationPipe) updateRole: UpdateRoleDto,
    @Req() req: RequestWithUser
  ) {
    return this.usersService.updateRole(updateRole, req.user);
  }

}
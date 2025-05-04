import {
  Body,
  Controller,
  Get, Param, ParseUUIDPipe, Patch, Post, Query
} from '@nestjs/common';

import { User } from '@/database/entities';
import { CurrUser, RequiredAuth, RolesGuard } from '../auth/decorators';
import { FindAllUserDto } from './dto/find_all_user.dto';
import { PaginatedResponseListUsers } from './response/all.response';
import { UsersService } from './users.service';
import { ResetPassDto } from './dto/reset_pass.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@RequiredAuth()
@RolesGuard()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('all')
  async findAll(
    @Query() findAllUserDto: FindAllUserDto
  ) {
    const response = await this.usersService.findAll(findAllUserDto);
    return new PaginatedResponseListUsers(response);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.usersService.findOne(id);
  }


  @Get(':id/categories-tasks')
  async getUserWithCategoriesAndTasks(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrUser() user: User,
  ) {
    return this.usersService.getUserWithCategoriesAndTasks(id);
  }

  @Post(':id/reset-password')
  async resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() resetPassDto: ResetPassDto,
    // @Req () req : RequestWithUser
  ): Promise<any> {
    return this.usersService.resetPassword(id, resetPassDto);
  }

  @Patch(':id/disable')
  async disableAccount(
    @Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.disableAccount(id);
  }

  @Patch('role')
  async updateRole(
    @Body() updateRole: UpdateRoleDto,
    @CurrUser() req: User,
  ) {
    return this.usersService.updateRole(updateRole, req);
  }
}

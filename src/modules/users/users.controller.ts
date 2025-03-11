import { Controller, Get, Post, Put, Query, Param, UseGuards, Req, Body, ParseIntPipe, ValidationPipe, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from './role.guard';
import { UsersService } from './users.service';
import { FindAllUserDto } from './dto/find_all_user.dto';
import { CategoriesService } from '../categories/categories.service';
@Controller('users')
// @UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  // @UseGuards(RoleGuard)
  async findAll(
    @Query(ValidationPipe) findAllUserDto: FindAllUserDto
  ) {
    return this.usersService.findAll(findAllUserDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  // @UseGuards(RoleGuard)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  // @Post(':id/reset-password')
  // @UseGuards(AuthGuard('jwt'))
  // // @UseGuards(RoleGuard)
  // async resetPassword(
  //   @Param('id') id: string,
  //   @Body("oldPassword") oldPassword: string,
  //   @Body("newPassword") newPassword: string
  // ): Promise<any> {
  //   return this.usersService.resetPassword(id, oldPassword, newPassword);
  // }

  // @Put(':id/disable')
  // @UseGuards(RoleGuard)
  // async disableAccount(@Param('id') id: string) {
  //   return this.usersService.disableAccount(id);
  // }

  // @Put(':id/role')
  // @UseGuards(RoleGuard)
  // async updateRole(
  //   @Param('id') id: string,
  //   @Query('role') role: 'user' | 'admin',
  //   @Req() req
  // ) {
  //   return this.usersService.updateRole(id, role, req.user);
  // }

  // @Get(':id/task-categories')
  // async getUserTaskCategories(@Param('id') id: string) {
  //   return this.usersService.getUserTaskCategories(id);
  // }
}
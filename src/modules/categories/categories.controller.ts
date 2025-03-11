import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesService } from './categories.service';
import { FindAllCategoryDto } from './dto/find_all.dto';
import { CreateCategoryDto } from './dto/create_category.dto';
import { UpdateCategoryDto } from './dto/update_category.dto';
import { Request } from 'express';
import { RequestWithUser } from './requestPost';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) { }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(
    @Query(ValidationPipe) category: FindAllCategoryDto,
  ) {
    return this.categoriesService.findAll(category);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Body(ValidationPipe) body: CreateCategoryDto,
    @Req() req: RequestWithUser
  ) {
    const userId = req.user.userId;
    return this.categoriesService.create(userId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) body: UpdateCategoryDto,
    // @Req() req
  ) {
    // const userId = req.user.userId;
    return this.categoriesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    // @Req() req
  ) {
    // const userId = req.user.userId;
    return this.categoriesService.delete(id);
  }
}

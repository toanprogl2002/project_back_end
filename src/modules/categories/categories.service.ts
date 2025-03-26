import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '@/database/entities/category.entity';
import { generateSlug } from 'src/utils/generate_slug';
import { Repository } from 'typeorm';

import { UsersService } from '../users/users.service';

import { CreateCategoryDto } from './dto/create_category.dto';
import { FindAllCategoryDto } from './dto/find_all.dto';
import { UpdateCategoryDto } from './dto/update_category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @Inject(forwardRef(() => UsersService)) // forwardRef ở đây
    private usersService: UsersService,
  ) { }

  async findAll(categories: FindAllCategoryDto) {
    const query = this.categoryRepository.createQueryBuilder('category');
    const page = categories.page || 1;
    const size = categories.size || 10;

    query.where('category.deleted = :deleted', { deleted: false });

    if (categories.name) {
      query.where('category.name LIKE :name', { name: `%${categories.name}%` });
      return {
        data: await query.getOne(),
        message: 'Lấy danh sách người dùng thành công',
      };
    }

    const [items, total] = await query
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();
    const next = page * size < total;
    const last_page = Math.ceil(total / size);

    return {
      data: items,
      metadata: {
        page,
        size,
        next,
        total,
        last_page,
      },
      message: 'Lấy danh sách người dùng thành công',
      status: true,
    };
  }

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    // Check if user exists
    const user = await this.usersService.findOne(userId);
    if (!user || user.deleted) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Generate slug from name
    const slug = generateSlug(createCategoryDto.name);

    const existingCategory = await this.categoryRepository.findOne({
      where: {
        userId: userId,
        name: createCategoryDto.name,
        deleted: false,
      },
    });

    if (existingCategory) {
      throw new ConflictException(
        'Danh mục với tên này đã tồn tại cho người dùng này',
      );
    }

    const category = this.categoryRepository.create({
      name: createCategoryDto.name,
      slug: slug,
      userId: userId,
      status: 1,
      createdBy: userId,
    });

    await this.categoryRepository.save(category);

    return {
      data: category,
      message: 'Tạo danh mục thành công',
      status: true,
    };
  }
  // src/modules/categories/categories.service.ts


  async findOne(
    categoryId: string,
    includeDeleted: boolean = false,
  ): Promise<Category> {
    const whereCondition: any = { id: categoryId };

    if (!includeDeleted) {
      whereCondition.deleted = false;
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      // relations: ['tasks', 'user'], // Include both tasks and user relations
    });

    if (!category) {
      throw new NotFoundException(
        `Danh mục với ID ${categoryId} không tồn tại`,
      );
    }
    return category;
  }

  async update(categoryId: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
        deleted: false,
      },
    });

    if (!category) {
      throw new NotFoundException('Danh mục không tồn tại');
    }

    const existingCategory = await this.categoryRepository.findOne({
      where: {
        // userId: userId,
        name: updateCategoryDto.name,
        deleted: false,
      },
    });

    if (existingCategory && existingCategory.id !== categoryId) {
      throw new ConflictException(
        'Danh mục với tên này đã tồn tại cho người dùng này',
      );
    }

    const slug = generateSlug(updateCategoryDto.name);

    category.name = updateCategoryDto.name;
    category.slug = slug;
    category.modifiedDate = new Date();

    await this.categoryRepository.update(categoryId, category);

    return {
      data: category,
      message: 'Cập nhật danh mục thành công',
      status: true,
    };
  }

  async delete(categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
        deleted: false,
      },
      relations: ['tasks'], // Load tasks
    });

    if (!category) {
      throw new NotFoundException('Danh mục không tồn tại');
    }

    const userId = await this.usersService.findOne(category.userId);

    if (category.userId !== userId.id) {
      throw new UnauthorizedException('Bạn không có quyền xóa danh mục này');
    }

    if (category.tasks && category.tasks.length > 0) {
      // Check if all tasks are completed
      const hasIncompleteTasks = category.tasks.some(
        (task) => task.status !== 2,
      ); // 2 = completed

      if (hasIncompleteTasks) {
        throw new ConflictException(
          'Không thể xóa danh mục này vì còn công việc chưa hoàn thành',
        );
      }
    }
    category.deleted = true;
    category.deletedDate = new Date();
    category.deletedBy = userId.id;

    await this.categoryRepository.save(category);

    return {
      data: category,
      message: 'Xóa danh mục thành công',
      status: true,
    };
  }
}

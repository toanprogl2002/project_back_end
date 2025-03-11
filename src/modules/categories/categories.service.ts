import { ConflictException, forwardRef, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { FindAllCategoryDto } from './dto/find_all.dto';
import { generateSlug } from 'src/utils/generate_slug';
import { CreateCategoryDto } from './dto/create_category.dto';
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

    if (categories.name) {
      query.where('category.name LIKE :name', { name: `%${categories.name}%` });
      return {
        data: await query.getOne(),
        message: 'Lấy danh sách người dùng thành công',
      }
    }

    const [users, total] = await query
      .skip((Number(page) - 1) * Number(size))
      .take(Number(size))
      .getManyAndCount();
    const next = Number(page) * Number(size) < total;
    const last_page = Math.ceil(total / Number(size));

    return {
      data: users,
      metadata: {
        page,
        size,
        next,
        total,
        last_page
      },
      message: 'Lấy danh sách người dùng thành công',
      status: true
    };
  }

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    // Check if user exists
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Generate slug from name
    const slug = generateSlug(createCategoryDto.name);

    const existingCategory = await this.categoryRepository.findOne({
      where: {
        userId: userId,
        name: createCategoryDto.name,
        deleted: false
      }
    });

    if (existingCategory) {
      throw new ConflictException('Danh mục với tên này đã tồn tại cho người dùng này');
    }

    const category = this.categoryRepository.create({
      name: createCategoryDto.name,
      slug: slug,
      userId: userId,
      status: 1,
      createdBy: userId
    });

    await this.categoryRepository.save(category);

    return {
      data: category,
      message: 'Tạo danh mục thành công',
      status: true
    };
  }

  async update(categoryId: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
        deleted: false
      }
    });

    if (!category) {
      throw new NotFoundException('Danh mục không tồn tại');
    }

    const existingCategory = await this.categoryRepository.findOne({
      where: {
        // userId: userId,
        name: updateCategoryDto.name,
        deleted: false
      }
    });

    if (existingCategory && existingCategory.id !== categoryId) {
      throw new ConflictException('Danh mục với tên này đã tồn tại cho người dùng này');
    }

    const slug = generateSlug(updateCategoryDto.name);

    category.name = updateCategoryDto.name;
    category.slug = slug;
    category.modifiedDate = new Date();

    await this.categoryRepository.update(categoryId, category);

    return {
      data: category,
      message: 'Cập nhật danh mục thành công',
      status: true
    };
  }

  async delete(categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
        deleted: false
      },
      relations: ['tasks'] // Load tasks
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
      const hasIncompleteTasks = category.tasks.some(task => task.status !== 2); // 2 = completed

      if (hasIncompleteTasks) {
        throw new ConflictException(
          'Không thể xóa danh mục này vì còn công việc chưa hoàn thành'
        );
      }
    }
    category.deleted = true;
    category.deletedDate = new Date();
    category.deletedBy = userId.id;

    await this.categoryRepository.update(categoryId, category);

    return {
      data: category,
      message: 'Xóa danh mục thành công',
      status: true
    };
  }


}

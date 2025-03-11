import { forwardRef, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { FindAllUserDto } from './dto/find_all_user.dto';
import { CategoriesService } from '../categories/categories.service';
import { Category } from 'src/entities/category.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(forwardRef(() => CategoriesService)) // Sử dụng forwardRef
    private categoriesService: CategoriesService,
  ) { }

  async findAll(findAllUserDto: FindAllUserDto) {
    const query = this.usersRepository.createQueryBuilder('user');
    const page = findAllUserDto.page || 1;
    const size = findAllUserDto.size || 10;
    // console.log(query);
    if (findAllUserDto.email) {
      query.where('user.email LIKE :email', { email: `%${findAllUserDto.email}%` });
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

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['categories']
    });
    // this.categoriesService.findAll
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUserWithCategoriesAndTasks(id: string) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.categories', 'category', 'category.deleted = :categoryDeleted', { categoryDeleted: false })
      .leftJoinAndSelect('category.tasks', 'task', 'task.deleted = :taskDeleted', { taskDeleted: false })
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return {
      data: user,
      message: 'Lấy thông tin người dùng thành công',
      status: true
    };
  }


  // async resetPassword(id: string, password: string, newPassword: string) {
  //   const user = await this.findOne(id);
  //   const isPasswordValid = await bcrypt.compare(password, user.password);
  //   if (!isPasswordValid) {
  //     throw new UnauthorizedException('Mật khẩu cũ không đúng');
  //   }
  //   // const newPass = bcrypt.hash(newPassword, 10);
  //   user.password = await bcrypt.hash(newPassword, 10);
  //   await this.usersRepository.save(user);
  //   return { message: 'Đổi mật khẩu thành công', };
  // }

  // async disableAccount(id: string) {
  //   const user = await this.findOne(id);
  //   user.status = 0; // 0 = disabled, 1 = active
  //   await this.usersRepository.save(user);
  //   return { message: 'Tài khoản đã bị vô hiệu hóa' };
  // }

  // async updateRole(id: string, role: 2 | 1 , currentUser: User) {
  //   if (currentUser.role !== 1) {
  //     throw new UnauthorizedException('Chỉ admin mới có quyền thay đổi role');
  //   }

  //   const user = await this.findOne(id);
  //   user.role = role;
  //   await this.usersRepository.save(user);
  //   return { message: 'Cập nhật quyền thành công' };
  // }

  // async getUserTaskCategories(userId: string) {
  //   const user = await this.usersRepository.findOne({
  //     where: { id: userId },
  //     relations: ['taskCategories', 'taskCategories.tasks'],
  //   });

  //   if (!user) {
  //     throw new NotFoundException('Người dùng không tồn tại');
  //   }

  //   return user.taskCategories;
  // }
}
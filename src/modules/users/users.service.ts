import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities/user.entity';
import { CategoriesService } from '../categories/categories.service';

import { FindAllUserDto } from './dto/find_all_user.dto';
import { ResetPassDto } from './dto/reset_pass.dto';
import { RequestWithUser } from '../categories/requestPost';
import { UpdateRoleDto } from './dto/update-role.dto';

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
      query.where('user.email LIKE :email', {
        email: `%${findAllUserDto.email}%`,
      });
    }

    const [users, total] = await query
      .andWhere('user.status = :status', { status: 1 })
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
        last_page,
      },
      message: 'Lấy danh sách người dùng thành công',
      status: true,
    };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['categories'],
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
      .leftJoinAndSelect(
        'user.categories',
        'category',
        'category.deleted = :categoryDeleted',
        { categoryDeleted: false },
      )
      .leftJoinAndSelect(
        'category.tasks',
        'task',
        'task.deleted = :taskDeleted',
        { taskDeleted: false },
      )
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return {
      data: user,
      message: 'Lấy thông tin người dùng thành công',
      status: true,
    };
  }

  async resetPassword(id: string, resetPassDto: ResetPassDto) {
    const user = await this.findOne(id);
    // const isPasswordValid = await bcrypt.compare(resetPassDto.oldPassword, user.password);
    // if (!isPasswordValid) {
    //   throw new UnauthorizedException('Mật khẩu cũ không đúng');
    // }
    user.password = await bcrypt.hash(resetPassDto.newPassword, 10);
    await this.usersRepository.save(user);
    return { message: 'Reset Password Thành Công', status: true };
  }

  async disableAccount(id: string) {
    const user = await this.findOne(id);
    user.status = 0; // 0 = disabled, 1 = active
    await this.usersRepository.update(id, user);
    return { message: 'Tài khoản đã bị vô hiệu hóa', status: true };
  }

  async updateRole(updateRole: UpdateRoleDto, currentUser: {
    userId: string;
    email: string;
    role?: 'user' | 'admin';
  }) {
    console.log('Current user from JWT:', currentUser);

    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền thay đổi vai trò người dùng');
    }

    const user = await this.usersRepository.findOne({
      where: { id: updateRole.id, status: 1 },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    user.role = updateRole.role;
    user.modifiedDate = new Date();
    user.modifiedBy = currentUser.userId;

    await this.usersRepository.save(user);

    return {
      data: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      message: `Đã cập nhật vai trò thành ${updateRole.role}`,
      status: true
    };
  }
}

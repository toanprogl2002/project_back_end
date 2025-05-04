import {
  BadRequestException, forwardRef,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { CategoriesService } from '../categories/categories.service';

import { buildPaginateQueryFilter } from '@/system/dbs';
import { _compare, _hash } from '../auth/utils';
import { FindAllUserDto } from './dto/find_all_user.dto';
import { ResetPassDto } from './dto/reset_pass.dto';
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

    const _query = await this.usersRepository.createQueryBuilder('user')
      .where('user.status = :status', { status: 1 })

    if (findAllUserDto.email) {
      _query.andWhere('user.email LIKE :email', {
        email: `%${findAllUserDto.email}%`,
      });
    }

    return buildPaginateQueryFilter(_query, findAllUserDto)
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUserWithCategoriesAndTasks(id: string) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.deleted = :deleted', { deleted: false })
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
    };
  }

  async resetPassword(id: string, resetPassDto: ResetPassDto) {
    const user = await this.findOne(id);
    const isPasswordValid = await _compare(resetPassDto.oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }
    user.password = await _hash(resetPassDto.newPassword);
    await this.usersRepository.save(user);
    return { message: 'Reset Password Thành Công', status: true };
  }

  async disableAccount(id: string) {
    const user = await this.findOne(id);
    user.status = 0; // 0 = disabled, 1 = active
    await this.usersRepository.update(id, user);
    return { message: 'Tài khoản đã bị vô hiệu hóa', status: true };
  }

  async updateRole(
    updateRole: UpdateRoleDto,
    CurrUsers: User,
  ) {

    const user = await this.usersRepository.findOne({
      where: { id: updateRole.id, status: 1 },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    user.role = updateRole.role;
    user.modified_date = new Date();
    user.modified_by = CurrUsers.id;

    await this.usersRepository.save(user);

    return {
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      message: `Đã cập nhật vai trò thành ${updateRole.role}`,
      status: true,
    };
  }
}

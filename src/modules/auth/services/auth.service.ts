import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { User } from '../../../database/entities/user.entity';

import { ChangePassDto } from '../requests/change_pass.dto';
import { LoginDto } from '../requests/login.dto';
import { RegisterDto } from '../requests/register.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { AuthConfig } from '@/config';
import { CacheService } from '@/system/cache';
import { ValidationException } from '@/system/exceptions';
import { ROLE_TYPE_ENUM } from '@/constants';
import ms from 'ms';
import {
  _compare,
  _hash,
  generateTokensPair,
  readOrCreateUserKey,
} from '../utils';
import { uuid } from '@/utils';
import { IPayloadToken } from '../interfaces';
import { Session } from '@/database/entities';

@Injectable()
export class AuthService {
  protected readonly _auth_config: AuthConfig;
  protected readonly _cache_service: CacheService;

  protected readonly _user_repo: Repository<User>;
  protected readonly _session_repo: Repository<Session>;

  constructor(
    data_source: DataSource,
    cache_service: CacheService,
    auth_config: AuthConfig,
  ) {
    this._auth_config = auth_config;
    this._cache_service = cache_service;

    this._user_repo = data_source.getRepository(User);
    this._session_repo = data_source.getRepository(Session);
  }

  async register(request: RegisterDto) {
    if (
      await this._user_repo.exists({
        where: { name: request.name },
      })
    )
      throw new ValidationException({ name: ['Tên đã tồn tại'] });
    if (
      await this._user_repo.exists({
        where: { email: request.email },
      })
    ) throw new ValidationException({ email: ['Email đã tồn tại'] });

    return await this._user_repo.save(
      this._user_repo.create({
        name: request.name,
        email: request.email,
        password: await _hash(request.password),
        role: ROLE_TYPE_ENUM.USER,
      }),
    );
    // const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    // if (
    //   await this.usersRepository.findOne({
    //     where: { email: registerDto.email },
    //   })
    // ) {
    //   throw new BadRequestException('Email đã tồn tại');
    // }
    // // console.log(this.refreshRepository)
    // const user = this.usersRepository.create({
    //   name: registerDto.name,
    //   email: registerDto.email,
    //   password: hashedPassword,
    // });
    // await this.usersRepository.save(user);
    // return { message: 'Đăng ký thành công', status: 201 };
  }

  async registerAdmin(request: RegisterDto) {
    if (
      await this._user_repo.exists({
        where: { name: request.name },
      })
    )
      throw new ValidationException({ name: ['Tên đã tồn tại'] });
    if (
      await this._user_repo.exists({
        where: { email: request.email },
      })
    ) throw new ValidationException({ email: ['Email đã tồn tại'] });

    return await this._user_repo.save(
      this._user_repo.create({
        name: request.name,
        email: request.email,
        password: await _hash(request.password),
        role: ROLE_TYPE_ENUM.ADMIN,
      }),
    );
  }

  async login(request: LoginDto) {
    const user = await this._user_repo
      .createQueryBuilder('_entity')
      .where('_entity.email = :email', { email: request.email })
      .getOne();

    if (!user || !(await _compare(request.password, user.password)))
      throw new BadRequestException();

    const { private_key, public_key } = readOrCreateUserKey(user.id);
    const time_expire = this.getTokenExpireConfig();

    const auth_id = uuid();

    const payload: IPayloadToken = {
      name: user.name,
      email: user.email,
      role: user.role,
      id: `auth:${auth_id}`,
    };
    const { access_token, refresh_token } = await generateTokensPair(
      payload,
      private_key,
      public_key,
      time_expire,
    );

    await this._cache_service.set(payload.id, payload, time_expire);
    // const test = this._cache_service.get(payload.id);
    await this._session_repo.save(
      this._session_repo.create({
        id: auth_id,
        user_id: user.id,
        access_token,
        refresh_token,
      }),
    );
    return { access_token, refresh_token };
  }


  // async refreshToken(token: string) {
  //   try {
  //     const decoded = this.jwtService.verify(token);

  //     if (decoded.type !== 'refresh') {
  //       throw new UnauthorizedException('Invalid token type');
  //     }

  //     const storedToken = await this.refreshRepository.findOne({
  //       where: { userId: decoded.sub, token: token },
  //     });

  //     if (!storedToken) {
  //       throw new UnauthorizedException('Invalid refresh token');
  //     }

  //     if (storedToken.expiresAt < new Date()) {
  //       await this.refreshRepository.delete({ userId: decoded.sub });
  //       throw new UnauthorizedException('Refresh token expired');
  //     }

  //     // 5. Tạo access token mới
  //     const user = await this.usersRepository.findOne({
  //       where: { id: decoded.sub },
  //     });
  //     if (!user) {
  //       throw new UnauthorizedException('User not found');
  //     }

  //     const payload = { email: user.email, sub: user.id };
  //     return {
  //       access_token: this.jwtService.sign(payload, { expiresIn: '60m' }),
  //       expires_in: 3600,
  //     };
  //   } catch (error) {
  //     // Xử lý các lỗi khác nhau
  //     if (error.name === 'JsonWebTokenError') {
  //       throw new UnauthorizedException('Invalid token');
  //     } else if (error.name === 'TokenExpiredError') {
  //       throw new UnauthorizedException('Token expired');
  //     }
  //     throw error;
  //   }
  // }

  async logout(session: Session) {
    await this._session_repo.update(
      session.id, {
      logout_at: new Date(),
    }
    )
    await this._cache_service.del(`auth:${session.id}`);
  }

  async changePassword(
    id: string,
    changePassDto: ChangePassDto,
  ) {
    const user = await this._user_repo.findOne({
      where: { id: id },
    });
    const clearSession = await this._session_repo.findOne({
      where: { user_id: id },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    if (!clearSession) {
      throw new NotFoundException('Không tìm thấy phiên đăng nhập');
    }
    // Verify old password
    const isPasswordValid = await _compare(
      changePassDto.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu cũ không đúng');
    }

    user.password = await _hash(changePassDto.newPassword);

    await this._user_repo.save(user);

    if (clearSession) {
      await this._session_repo.delete(clearSession.id);
      await this._cache_service.del(`auth:${id}`);
    }
    return { message: 'Đổi mật khẩu thành công' };
  }
  // async changePassword(id: string, changePassDto: ChangePassDto) {
  //   // Check if new password matches confirm password
  //   if (changePassDto.newPassword !== changePassDto.confirmPassword) {
  //     throw new Error('Mật khẩu mới và xác nhận mật khẩu không khớp');
  //   }

  //   const user = await this.usersRepository.findOne({ where: { id } });
  //   // console.log(user)
  //   if (!user) {
  //     throw new Error('Người dùng không tồn tại');
  //   }

  //   // Verify old password
  //   const isPasswordValid = await bcrypt.compare(
  //     changePassDto.oldPassword,
  //     user.password,
  //   );
  //   if (!isPasswordValid) {
  //     throw new Error('Mật khẩu cũ không đúng');
  //   }

  //   // Hash and save new password
  //   user.password = await bcrypt.hash(changePassDto.newPassword, 10);
  //   await this.usersRepository.save(user);

  //   return { message: 'Đổi mật khẩu thành công' };
  // }

  // async getUserById(id: string) {
  //   const user = this.usersRepository.findOne({ where: { id } });
  //   if (!user) {
  //     throw new Error('Người dùng không tồn tại');
  //   }
  //   return user;
  // }

  async getByUsername(name?: string) {
    return this._user_repo.findOne({ where: { name } });
  }

  async getSessionByToken(access_token: string) {
    return this._session_repo.findOne({ where: { access_token } });
  }

  getTokenExpireConfig() {
    return ms(this._auth_config.getTokenExpires() as ms.StringValue) / 1000;
  }
}

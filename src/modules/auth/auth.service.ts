import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from 'src/entities/refresh_token.entity';
import { Repository } from 'typeorm';

import { User } from '../../entities/user.entity';

import { ChangePassDto } from './dto/change_pass.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  private tokenBlacklist: Set<string> = new Set();
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshRepository: Repository<RefreshToken>,
    @InjectRedis() private readonly redis: Redis,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    if (
      await this.usersRepository.findOne({
        where: { email: registerDto.email },
      })
    ) {
      throw new BadRequestException('Email đã tồn tại');
    }
    // console.log(this.refreshRepository)
    const user = this.usersRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
    });
    await this.usersRepository.save(user);
    return { message: 'Đăng ký thành công', status: 201 };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });
    // console.log(user)
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new BadRequestException('Email hoặc mật khẩu không đúng');
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '60m' });
    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      { expiresIn: '7d' },
    );

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save refresh token to dedicated table
    const check_id_for = await this.refreshRepository.findOne({
      where: { userId: user.id },
    });
    if (check_id_for?.userId === user.id) {
      await this.refreshRepository.update(
        { userId: user.id },
        {
          token: refreshToken,
          expiresAt,
        },
      );
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    }

    await this.refreshRepository.save({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const storedToken = await this.refreshRepository.findOne({
        where: { userId: decoded.sub, token: token },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (storedToken.expiresAt < new Date()) {
        await this.refreshRepository.delete({ userId: decoded.sub });
        throw new UnauthorizedException('Refresh token expired');
      }

      // 5. Tạo access token mới
      const user = await this.usersRepository.findOne({
        where: { id: decoded.sub },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const payload = { email: user.email, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload, { expiresIn: '60m' }),
        expires_in: 3600,
      };
    } catch (error) {
      // Xử lý các lỗi khác nhau
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      } else if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      throw error;
    }
  }

  async logout(userId: string, token?: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    const refreshToken = await this.refreshRepository.findOne({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    if (refreshToken) {
      await this.refreshRepository.delete({ userId });
    }
    if (token) {
      try {
        const decoded = this.jwtService.decode(token);
        if (decoded && typeof decoded === 'object' && decoded.exp) {
          const remainingTime = decoded.exp - Math.floor(Date.now() / 1000);
          if (remainingTime > 0) {
            // Lưu token vào Redis với thời gian hết hạn
            await this.redis.set(token, 'blacklisted', 'EX', remainingTime);
          }
        }
      } catch (error) {
        console.error('Error handling token blacklist:', error);
      }
    }
    return;
  }

  // isTokenBlacklisted(token: string): boolean {
  //   return this.tokenBlacklist.has(token);
  // }
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.redis.get(token);
    return result === 'blacklisted';
  }

  async changePassword(id: string, changePassDto: ChangePassDto) {
    // Check if new password matches confirm password
    if (changePassDto.newPassword !== changePassDto.confirmPassword) {
      throw new Error('Mật khẩu mới và xác nhận mật khẩu không khớp');
    }

    const user = await this.usersRepository.findOne({ where: { id } });
    // console.log(user)
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(
      changePassDto.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new Error('Mật khẩu cũ không đúng');
    }

    // Hash and save new password
    user.password = await bcrypt.hash(changePassDto.newPassword, 10);
    await this.usersRepository.save(user);

    return { message: 'Đổi mật khẩu thành công' };
  }

  async getUserById(id: string) {
    const user = this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }
    return user;
  }
}

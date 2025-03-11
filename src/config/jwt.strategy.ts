import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/entities/user.entity';
import { AuthService } from 'src/modules/auth/auth.service';
import { Repository } from 'typeorm';

import { JWT_SECRET } from './secret';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(AuthService)
    private AuthService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    // 1. Kiểm tra nếu là refresh token
    if (payload.type === 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // 2. Lấy token từ request header
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    // 3. Kiểm tra token có trong blacklist không
    if (token && this.AuthService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // 4. Kiểm tra user tồn tại
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 5. Trả về thông tin user
    return {
      userId: payload.sub,
      email: payload.email,
      role: user.role,
    };
  }
}

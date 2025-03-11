import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from 'src/entities/refresh_token.entity';
import { User } from 'src/entities/user.entity';

import { JwtStrategy } from '../../config/jwt.strategy';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, RefreshToken]),
		PassportModule.register({ defaultStrategy: 'jwt' }),
	],
	providers: [AuthService, JwtStrategy],
	controllers: [AuthController],
	exports: [AuthService],
})
export class AuthModule {}

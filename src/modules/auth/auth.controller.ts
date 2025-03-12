import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ChangePassDto } from './dto/change_pass.dto';
import { LoginDto } from './dto/login.dto';
// import { loginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestWithUser } from './auth';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UseGuards(AuthGuard('jwt'))
  login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt'))
  refreshToken(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post(':id/change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(ValidationPipe) changePassDto: ChangePassDto,
  ) {
    try {
      return await this.authService.changePassword(id, changePassDto);
    } catch (error) {
      throw new UnauthorizedException(id, error.message);
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(
    @Req() req: RequestWithUser
  ) {
    try {
      const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ header
      return this.authService.logout(req.user.userId, token);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Người dùng không tồn tại');
      }
      throw new UnauthorizedException('Lỗi khi đăng xuất');
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  getUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.authService.getUserById(id);
  }
}

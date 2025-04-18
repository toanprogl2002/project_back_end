import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';

import { ChangePassDto } from '../requests';
import { LoginDto } from '../requests';
import { RegisterDto } from '../requests';
// import { RequestWithUser } from './auth';
import { AuthService } from '../services';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { Profile } from '../responses';
import { AuthConfig } from '@/config';
import { DataResponse } from '@/system/response';
import { Response } from 'express';
import ms, { StringValue } from 'ms';
import { Cookies, RequiredAuth } from '../decorators';
import { Session } from '@/database/entities';

@ApiExtraModels(Profile)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly auth_config: AuthConfig,
  ) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() request: RegisterDto) {
    const result = await this.authService.register(request);
    return new DataResponse({
      id: result.id,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() request: LoginDto,
    @Cookies() cookies: Session,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { access_token, refresh_token } =
      await this.authService.login(request);
    response.cookie(this.auth_config.getAccessCookieName(), access_token, {
      httpOnly: true,
      maxAge: ms(this.auth_config.getTokenExpires() as StringValue),
    }); // 1 days

    response.cookie(this.auth_config.getRefreshCookieName(), refresh_token, {
      httpOnly: true,
      maxAge: ms(this.auth_config.getTokenExpires() as StringValue) * 7,
    });
  }

  @RequiredAuth()
  @Get('logout')
  // @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    // @Cookies() cookies: Session,
    // @Res({ passthrough: true }) response: Response
  ) {
    // return cookies;
    // console.log(cookies);
    // console.log(response);
    // if (cookies) await this.authService.logout(cookies);
    // response.clearCookie(this.auth_config.getAccessCookieName());
    // response.clearCookie(this.auth_config.getRefreshCookieName());
  }
  // @Post('refresh')
  // @UseGuards(AuthGuard('jwt'))
  // refreshToken(@Body('refresh_token') refreshToken: string) {
  //   return this.authService.refreshToken(refreshToken);
  // }

  @Post(':id/change-password')
  @RequiredAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
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

  // @Post('logout')
  // @UseGuards(AuthGuard('jwt'))
  // async logout(
  //   // @Req() req: RequestWithUser
  // ) {
  //   // try {
  //   //   const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ header
  //   //   return this.authService.logout(req.user.userId, token);
  //   // } catch (error) {
  //   //   if (error instanceof NotFoundException) {
  //   //     throw new UnauthorizedException('Người dùng không tồn tại');
  //   //   }
  //   //   throw new UnauthorizedException('Lỗi khi đăng xuất');
  //   // }
  // }

  // @Get(':id')
  // @UseGuards(AuthGuard('jwt'))
  // getUserById(@Param('id', new ParseUUIDPipe()) id: string) {
  //   return this.authService.getUserById(id);
  // }
}

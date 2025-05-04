import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus, Param,
  ParseUUIDPipe,
  Post, Res,
  UnauthorizedException, ValidationPipe
} from '@nestjs/common';

import { ChangePassDto, LoginDto, RegisterDto } from '../requests';
// import { RequestWithUser } from './auth';
import { AuthConfig } from '@/config';
import { Session } from '@/database/entities';
import { DataResponse } from '@/system/response';
import { ApiExtraModels } from '@nestjs/swagger';
import { Response } from 'express';
import ms, { StringValue } from 'ms';
import { Cookies, RequiredAuth } from '../decorators';
import { Profile } from '../responses';
import { AuthService } from '../services';

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
    });

    response.cookie(this.auth_config.getRefreshCookieName(), refresh_token, {
      httpOnly: true,
      maxAge: ms(this.auth_config.getTokenExpires() as StringValue) * 7,
    });
    return new DataResponse({
      access_token,
      refresh_token,
    });
  }

  @RequiredAuth()
  @Get('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Cookies() cookies: Session,
    @Res({ passthrough: true }) response: Response
  ) {
    if (cookies) await this.authService.logout(cookies);
    response.clearCookie(this.auth_config.getAccessCookieName());
    response.clearCookie(this.auth_config.getRefreshCookieName());
  }

  @Post('refresh')
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    const { access_token } = await this.authService.refreshToken(refreshToken);
    return {
      access_token: access_token,
    };
  }

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

  @Get(':id')
  @RequiredAuth()
  getUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.authService.getUserById(id);
  }
}

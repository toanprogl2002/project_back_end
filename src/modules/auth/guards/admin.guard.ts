import {
  CanActivate,
  ExecutionContext, ForbiddenException, Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IPayloadToken } from '../interfaces';
import { AuthService } from '../services';
import { verify } from '../utils';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    protected readonly _auth_service: AuthService,
  ) {
    this.reflector = reflector;
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = request.cookies['access_token'];

    const session = await this._auth_service.getSessionByToken(accessToken);

    if (!session || !!session.logout_at) throw new UnauthorizedException();
    const payload: IPayloadToken | null = await verify(
      accessToken,
      session!.user_id,
    );

    if (payload?.role !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    return true;
  }
}
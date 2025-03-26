import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { CacheService } from '@/system/cache';

import { IPayloadToken } from '../interfaces';
import { AuthService } from '../services';
import { verify } from '../utils';
import { AuthConfig } from '@/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    protected readonly _auth_service: AuthService,
    protected readonly _auth_config: AuthConfig,
    protected readonly _cache_service: CacheService,
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = await this.extractTokens(request);

    if (!token) throw new UnauthorizedException();

    try {
      const session = await this._auth_service.getSessionByToken(token);

      if (!session || !!session.logout_at) throw new UnauthorizedException();

      const payload: IPayloadToken | null = await verify(token, session.user_id);

      if (
        payload &&
        payload.id &&
        !(await this._cache_service.get<IPayloadToken>(payload.id))
      )
        throw new UnauthorizedException();

      const user = await this._auth_service.getByUsername(payload?.name);
      if (!user) throw new UnauthorizedException();

      request['_session'] = session;
      request['_user'] = user;
    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;
  }

  protected async extractTokens(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') || [];

    if (type === 'Bearer' && token?.trim().length) return token;

    return (
      request.cookies?.[this._auth_config.getAccessCookieName()] ?? undefined
    );
  }
}

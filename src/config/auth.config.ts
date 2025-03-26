import { Inject, Injectable } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

const NAME_CONFIG = 'auth';

export const auth_config = registerAs(NAME_CONFIG, () => ({
  token_expires: process.env.AUTH_TOKEN_EXPIRES ?? '24h',
  access_cookie_name: process.env.AUTH_ACCESS_COOKIE_NAME ?? '__access_session',
  refresh_cookie_name:
    process.env.AUTH_REFRESH_COOKIE_NAME ?? '__refresh_session',
}));

@Injectable()
export class AuthConfig {
  constructor(
    @Inject(auth_config.KEY)
    protected readonly config: ConfigType<typeof auth_config>,
  ) {}

  getTokenExpires(): string {
    return this.config.token_expires;
  }

  getAccessCookieName(): string {
    return this.config.access_cookie_name;
  }

  getRefreshCookieName(): string {
    return this.config.refresh_cookie_name;
  }
}

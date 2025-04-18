import { Inject, Injectable } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

const NAME_CONFIG = 'app';

export const app_config = registerAs(NAME_CONFIG, () => ({
  host: process.env.APP_HOST ?? 'localhost',
  post: Number(process.env.APP_PORT) ?? 8080,
  api_document: process.env.APP_API_DOCUMENT === 'true',
}));

@Injectable()
export class AppConfig {
  constructor(
    @Inject(app_config.KEY)
    protected readonly config: ConfigType<typeof app_config>,
  ) {}

  getHost(): string {
    return this.config.host;
  }

  getPort(): number {
    return this.config.post;
  }

  getApiDocument(): boolean {
    return this.config.api_document;
  }
}

import { Global, Module } from '@nestjs/common';
import { ConfigModule as _ConfigModule } from '@nestjs/config';

import { configs, services } from '@/config';
import { isProduction } from '@/utils';

@Global()
@Module({
  imports: [
    _ConfigModule.forRoot({
      isGlobal: true,
      cache: isProduction(),
      expandVariables: true,
      load: configs,
    }),
  ],
  providers: services,
  exports: services,
})
export class ConfigModule {}

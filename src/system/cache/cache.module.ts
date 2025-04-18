import {
  CacheModule as _cacheModule,
  CacheModuleOptions,
} from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { RedisOptions } from 'ioredis';

import { RedisConfig } from '@/config';

import { CacheService } from './services';

import { Module } from '@nestjs/common';
import { CacheController } from './controller';

@Module({
  imports: [
    _cacheModule.registerAsync<RedisOptions>({
      inject: [RedisConfig],
      useFactory: async (
        _redis_config: RedisConfig,
      ): Promise<CacheModuleOptions> => ({
        store: await redisStore({
          host: _redis_config.getHost(),
          port: _redis_config.getPort(),
          username: _redis_config.getUsername(),
          password: _redis_config.getPassword(),
          db: 0,
        }),
      }),
    }),
  ],
  controllers: [CacheController],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule { }

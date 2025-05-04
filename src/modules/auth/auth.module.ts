import { Global, Module } from '@nestjs/common';

import { CacheModule } from '@/system/cache';
import { AuthController } from './controllers';
import { AdminGuard, JwtAuthGuard } from './guards';
import { AuthService } from './services';

@Global()
@Module({
  imports: [
    CacheModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    AdminGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    CacheModule,
    AdminGuard
  ],
})
export class AuthModule { }

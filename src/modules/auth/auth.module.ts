import { Global, Module } from '@nestjs/common';

import { AuthController } from './controllers';
import { AuthService } from './services';
import { JwtAuthGuard } from './guards';
import { CacheModule } from '@/system/cache';

@Global()
@Module({
  imports: [
    CacheModule,
    // TypeOrmModule.forFeature([User, RefreshToken]),
    // PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}

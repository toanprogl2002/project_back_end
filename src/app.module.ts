import { DbsModule } from './system/dbs';
import { CacheModule } from './system/cache/cache.module';
import { LoggerModule } from './system/log/logger.module';
import { ConfigModule } from '@/system/config';
import { ExcelService } from './modules/reports/excel.service';
import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
// import { DatabaseModule } from './database/database.module';
// import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
// import { APP_GUARD } from "@nestjs/core";
import { DataSource } from 'typeorm';

// import { JWT_SECRET } from './config/secret';
// import { DatabaseModule } from './database/database.module';
import { modules } from './modules';
@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    CacheModule,
    DbsModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 3,
      },
    ]),
    ...modules,
    // DevtoolsModule.register({
    //   http: process.env.NODE_ENV !== 'production',
    // }),
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   envFilePath: '.env',
    // }),
    // JwtModule.register({
    //   global: true, // Make JWT module global
    //   secret: process.env.JWT_SECRET,
    //   signOptions: { expiresIn: '60m' },
    // }),
    // PassportModule.register({ defaultStrategy: 'jwt' }),
    // UsersModule,
    // AuthModule,
    // CategoriesModule,
    // TasksModule,
    // DatabaseModule,
    // ReportsModule,
  ],
  controllers: [],
  providers: [
    // ExcelService,
    // JwtStrategy,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // }
  ],
})
export class AppModule {
  // constructor(private dataSource: DataSource) { }
}

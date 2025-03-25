import { LoggerModule } from './system/log/logger.module';
import { ConfigModule } from '@/system/config';
import { ExcelService } from './modules/reports/excel.service';
import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
// import { DatabaseModule } from './database/database.module';
// import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
// import { APP_GUARD } from "@nestjs/core";
import { DataSource } from 'typeorm';

// import { JWT_SECRET } from './config/secret';
import { DatabaseModule } from './database/database.module';
import { CatchEverythingFilter } from './exceptions/all-exceptions.filter';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { UsersModule } from './modules/users/users.module';
import { ReportsModule } from './modules/reports/reports.module';
import { RedisModule } from '@nestjs-modules/ioredis'
@Module({
  imports: [
    LoggerModule,
    ConfigModule,
    // RedisModule.forRoot({
    //   type: 'single',
    //   url: 'redis://localhost:6379',
    // }),
    // ThrottlerModule.forRoot([
    //   {
    //     name: 'short',
    //     ttl: 1000,
    //     limit: 3,
    //   },
    //   {
    //     name: 'long',
    //     ttl: 60000,
    //     limit: 3,
    //   },
    // ]),
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
    // {
    //   provide: APP_FILTER,
    //   useClass: CatchEverythingFilter,
    // },
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

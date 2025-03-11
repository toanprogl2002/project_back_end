import { UsersModule } from './modules/users/users.module';
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
// import { DatabaseModule } from './database/database.module';
// import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
// import { APP_GUARD } from "@nestjs/core";
import { DataSource } from 'typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JWT_SECRET } from './config/secret';
import { DatabaseModule } from './database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './config/jwt.strategy';
import { ThrottlerModule } from '@nestjs/throttler';
import { DevtoolsModule } from '@nestjs/devtools-integration';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 1000,
      limit: 3,
    },
    {
      name: 'long',
      ttl: 60000,
      limit: 3,
    }]),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({
      global: true, // Make JWT module global
      secret: JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    TasksModule,
    DatabaseModule,
  ],
  controllers: [
    AppController
  ],
  providers: [AppService,
    // JwtStrategy,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // }
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) { }
}

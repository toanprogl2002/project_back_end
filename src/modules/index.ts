import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ReportsModule } from './reports/reports.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

export const modules = [
  AuthModule,
  CategoriesModule,
  ReportsModule,
  TasksModule,
  UsersModule,
];

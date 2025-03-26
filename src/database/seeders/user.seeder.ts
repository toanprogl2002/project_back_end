import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import * as bcrypt from 'bcrypt';

import { User } from '../entities/user.entity';
import { ROLE_TYPE_ENUM } from '@/constants/enums';

export default class UserSeeder implements Seeder {
  public async run(data_source: DataSource): Promise<void> {
    const user_repository = data_source.getRepository(User);

    const name = 'Administator';
    const email = 'admin@personal.com';

    const user = user_repository.create({
      email,
      name,
      password: await bcrypt.hash('12345', 10),
      role: ROLE_TYPE_ENUM.ADMIN,
    });

    await user_repository.save(user);
  }
}

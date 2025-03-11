// src/shared/interfaces/request-with-user.interface.ts
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role?: 'user' | 'admin';
    [key: string]: any;
  };
}

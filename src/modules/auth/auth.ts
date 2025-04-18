import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    // Add other JWT payload properties as needed
  };
}

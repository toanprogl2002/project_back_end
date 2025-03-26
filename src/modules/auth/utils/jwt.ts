import { BadRequestException } from '@nestjs/common';
import jwt from 'jsonwebtoken';

import { IPayloadToken } from '../interfaces';
import { readUserKeys } from './crypto';

export const generateTokensPair = async (
  payload: IPayloadToken,
  private_key: string,
  public_key: string,
  time_expire: number,
) => {
  const [access_token, refresh_token] = await Promise.all([
    jwt.sign(payload, private_key, {
      algorithm: 'RS256',
      expiresIn: time_expire,
    }),
    jwt.sign({ id: payload.id }, private_key, {
      algorithm: 'RS256',
      expiresIn: time_expire * 7,
    }),
  ]);

  jwt.verify(access_token, public_key, (err, decoded) => {
    if (err) {
      console.log('error verify::', err);

      throw new BadRequestException(err.message ?? 'Error verify access_token');
    } else {
      console.log('decoded verify::', decoded);
    }
  });

  return { access_token, refresh_token };
};

export const verify = async (
  token: string,
  user_id: string,
): Promise<IPayloadToken | null> => {
  const public_key = readUserKeys(user_id)?.public_key;

  if (!public_key) return null;
  else {
    return new Promise((resolve, reject) => {
      jwt.verify(token, public_key, (err, decoded) => {
        if (err) {
          console.log('error verify::', err);
          reject(null);
        } else {
          resolve(decoded as IPayloadToken);
        }
      });
    });
  }
};

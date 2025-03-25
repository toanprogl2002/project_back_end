import { ENVIRONMENT_ENUM } from '@/constants/enums';

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === ENVIRONMENT_ENUM.DEVELOPMENT;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === ENVIRONMENT_ENUM.PRODUCTION;
}

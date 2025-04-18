// src/common/decorators/cookies.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request['_session']?.[data] ?? request.cookies[data] ?? null;
  },
);
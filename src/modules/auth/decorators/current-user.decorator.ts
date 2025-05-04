import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request['_user'];
  },
);

import { applyDecorators, UseGuards } from "@nestjs/common";
import { Reflector } from '@nestjs/core';
import { AdminGuard } from "../guards";



export const RolesGuard = () => {
  return applyDecorators(UseGuards(AdminGuard));
}

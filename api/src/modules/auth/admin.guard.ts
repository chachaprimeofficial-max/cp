import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';

type AdminRequest = Request & { user?: { role?: string } };

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    if (request.user?.role !== 'admin') {
      throw new ForbiddenException('Administrator access is required.');
    }
    return true;
  }
}

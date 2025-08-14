import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  matchRoles(roles: string[], userRole: string) {
    return roles.some((role) => role === userRole);
  }

  canActivate(context: ExecutionContext): boolean {
    // get list roles param value on Roles decorator
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    // get request value
    const request = context.switchToHttp().getRequest();

    // get token from header authorization request
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      return false;
    }

    // decode token then get the role of user
    const decodedJwt = this.jwtService.decode(token) as any;
    const userRole = decodedJwt.role;

    return this.matchRoles(roles, userRole);
  }
}

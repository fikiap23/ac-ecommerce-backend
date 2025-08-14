import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  matchAccess(allowed: string[], access: string) {
    return allowed.some((allow) => allow === access);
  }

  canActivate(context: ExecutionContext): boolean {
    // get list allowed param value on Allowed decorator
    const allowed = this.reflector.get<string[]>(
      'access',
      context.getHandler(),
    );
    if (!allowed) {
      return true;
    }

    // get request value
    const request = context.switchToHttp().getRequest();

    // get token from header authorization request
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      return false;
    }

    // decode token then get the token type
    const decodedJwt = this.jwtService.decode(token) as any;
    const access = decodedJwt.access;

    return this.matchAccess(allowed, access);
  }
}

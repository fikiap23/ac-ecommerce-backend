import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const affiliateCode = req.query['affiliate-code'];

    return {
      scope: ['profile', 'email'],
      state: JSON.stringify({ affiliateCode }),
    };
  }
}

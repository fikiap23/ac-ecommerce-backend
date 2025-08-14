import { AuthService } from './auth.service';
import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Res,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ForgotPasswordTeamDto,
  ResetPasswordTeamDto,
  SigninAdminDto,
  SignInTeamDto,
} from './dto/auth.dto';
import { formatResponse } from 'helpers/http.helper';
import { errorHandler } from 'helpers/validation.helper';
import { GoogleOauthGuard } from './guard/google.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Get('customers/google')
  @UseGuards(GoogleOauthGuard)
  async customersGoogle() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    try {
      const token = await this.authService.customersGoogle(req.user);

      if (!token) {
        return res.redirect(`${this.configService.get('FRONTEND_URL')}`);
      }

      return res.redirect(
        `${this.configService.get('FRONTEND_URL')}?token=${token.access_token}`,
      );
    } catch (error) {
      return res.redirect(
        `${this.configService.get('FRONTEND_URL')}?error=${error.message}`,
      );
    }
  }

  @Post('admin/signin')
  async signinAdmin(@Body() dto: SigninAdminDto, @Res() res: Response) {
    try {
      const result = await this.authService.signinAdmin(dto);

      return formatResponse(res, HttpStatus.CREATED, result);
    } catch (error) {
      errorHandler(res, error);
    }
  }
}

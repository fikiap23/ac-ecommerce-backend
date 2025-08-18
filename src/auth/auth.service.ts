import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PayloadToken } from './type';
import { Injectable } from '@nestjs/common';
import { CustomerGoogleDto, SigninAdminDto } from './dto/auth.dto';
import { CustomerRepository } from 'src/customer/repositories/customer.repository';
import { UserManagementRepository } from 'src/user-management/repositories/user-management.repository';
import { Customer, TypeRoleUser } from '@prisma/client';
import { CustomError } from 'helpers/http.helper';
import { MailService } from 'src/mail/services/mail.service';

@Injectable({})
export class AuthService {
  constructor(
    private jwt: JwtService,
    private readonly customerRepository: CustomerRepository,
    private readonly userManagementRepository: UserManagementRepository,
    private readonly mailService: MailService,
  ) {}

  async customersGoogle(dto: CustomerGoogleDto) {
    let existingCustomer = await this.customerRepository.getByEmail({
      email: dto.email,
    });

    let customer: Customer;
    if (!existingCustomer) {
      customer = await this.customerRepository.create({
        data: {
          email: dto.email,
          name: dto.name,
          profilePic: dto.picture,
          phoneNumber: null,
        },
      });
    } else {
      if (existingCustomer?.role !== TypeRoleUser.CUSTOMER) {
        return false;
      }
      customer = existingCustomer;
    }

    return await this.signJwtTokenCustomer(customer.id, customer.uuid);
  }

  async signinAdmin(dto: SigninAdminDto) {
    // get user
    const user = await this.userManagementRepository.getThrowByEmail({
      email: dto.email,
    });

    // check password is match
    const isPasswordMatch = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordMatch) {
      throw new CustomError({
        message: 'Unauthorized',
        statusCode: 401,
      });
    }

    return this.signJwtTokenAdmin(user.uuid, user.role);
  }

  private async signJwtTokenCustomer(
    idUser: number,
    uuid: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: uuid,
      id: idUser,
      role: 'CUSTOMER',
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET,
    });

    return { access_token: token };
  }

  private async signJwtTokenAdmin(
    idUser: string,
    role: string,
  ): Promise<{ access_token: string }> {
    //  payload user data for jwt token
    const payload = {
      sub: idUser,
      role,
    };

    // create token with data payload
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET,
    });

    return { access_token: token };
  }

  async decodeJwtToken(accessToken: string) {
    const decodedJwt = this.jwt.decode(
      accessToken.split(' ')[1],
    ) as PayloadToken;

    return decodedJwt;
  }

  async verifyJwtToken(accessToken: string) {
    try {
      const token = accessToken.split(' ')[1];

      const verifiedPayload = await this.jwt.verifyAsync<PayloadToken>(token, {
        secret: process.env.JWT_SECRET,
      });

      return verifiedPayload;
    } catch (error) {
      throw new CustomError({
        message: 'Unauthorized',
        statusCode: 401,
      });
    }
  }
}

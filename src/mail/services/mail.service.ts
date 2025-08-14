import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { IEmailInvoice } from '../interfaces/neo-invoice.interface';
import { IEmailResetPassword } from '../interfaces/neo-reset-password.interface';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendInvoice(data: IEmailInvoice) {
    return await this.mailerService.sendMail({
      to: data.email,
      subject: data.subject,
      template: './neo-invoice',
      from: 'no-reply@neowellness.id',
      context: {
        ...data,
      },
    });
  }

  async sendResetPassword(data: IEmailResetPassword) {
    return await this.mailerService.sendMail({
      to: data.email,
      subject: data.subject,
      template: './neo-reset-password',
      from: 'no-reply@neowellness.id',
      context: {
        ...data,
      },
    });
  }
}

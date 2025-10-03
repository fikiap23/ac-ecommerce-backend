import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { IEmailInvoice } from '../interfaces/invoice.interface';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendInvoice(data: IEmailInvoice) {
    return await this.mailerService.sendMail({
      to: data.email,
      subject: data.subject,
      template: './invoice',
      from: 'no-reply@gsolusi.id',
      context: {
        ...data,
      },
    });
  }
}

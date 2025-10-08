import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { IEmailInvoice } from '../interfaces/invoice.interface';
import { PdfService } from './pdf.service';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly pdfService: PdfService,
  ) {}

  async sendInvoice(data: IEmailInvoice) {
    // Generate PDF invoice
    const pdfBuffer = await this.pdfService.generateInvoicePdf(data.order);

    return await this.mailerService.sendMail({
      to: data.email,
      subject: data.subject,
      template: './invoice',
      from: 'no-reply@gsolusi.id',
      context: {
        ...data,
      },
      attachments: [
        {
          filename: `invoice-${data.order.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }
}

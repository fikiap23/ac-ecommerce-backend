import { Injectable } from '@nestjs/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IOrder } from '../interfaces/invoice.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PdfService {
  constructor(private readonly httpService: HttpService) {}

  async generateInvoicePdf(orderData: IOrder): Promise<Buffer> {
    const doc = new jsPDF();

    // Logo - Add your company logo
    // Option 1: Use text logo (current implementation)
    // Option 2: Load from URL using loadImageAsBase64() method below
    const logoUrl = 'https://picsum.photos/150/50'; // Random image placeholder

    try {
      const logoBase64 = await this.loadImageAsBase64(logoUrl);
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 15, 10, 40, 13);
      } else {
        throw new Error('Failed to load logo');
      }
    } catch (error) {
      // Fallback to text logo if image fails to load
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(76, 175, 80); // Green color
      doc.text('G-Solusi', 15, 18);
    }

    // Company Info (right side)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text('G-Solusi E-Commerce', pageWidth - 15, 15, { align: 'right' });
    doc.text('Email: support@gsolusi.id', pageWidth - 15, 20, {
      align: 'right',
    });
    doc.text('Website: www.gsolusi.id', pageWidth - 15, 25, { align: 'right' });

    // Invoice Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('INVOICE', 15, 40);

    // Horizontal line
    doc.setDrawColor(76, 175, 80);
    doc.setLineWidth(0.5);
    doc.line(15, 45, pageWidth - 15, 45);

    // Order Information
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);

    const startY = 55;
    doc.text('Order Information', 15, startY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    // Left column
    doc.text('Order ID:', 15, startY + 8);
    doc.text('Customer Name:', 15, startY + 14);
    doc.text('Email:', 15, startY + 20);
    doc.text('Phone:', 15, startY + 26);

    doc.setFont('helvetica', 'bold');
    doc.text(orderData.id, 50, startY + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(orderData.name, 50, startY + 14);
    doc.text(orderData.email, 50, startY + 20);
    doc.text(orderData.phone, 50, startY + 26);

    // Right column
    doc.text('Status:', pageWidth - 80, startY + 8);
    doc.text('Address:', pageWidth - 80, startY + 14);

    // Status with color badge
    const statusX = pageWidth - 40;
    const statusY = startY + 8;
    const statusColor = this.hexToRgb(orderData.statusColor || '#4CAF50');
    doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
    doc.roundedRect(statusX - 2, statusY - 4, 35, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(orderData.status, statusX, statusY, { align: 'left' });

    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');
    const addressLines = doc.splitTextToSize(orderData.address, 60);
    doc.text(addressLines, pageWidth - 40, startY + 14);

    // Products Table
    const tableStartY = startY + 40;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Order Items', 15, tableStartY - 5);

    const tableData = orderData.products.map((product, index) => {
      const price = parseFloat(product.price) || 0;
      const discount = parseFloat(product.discount) || 0;
      const qty = product.qty || 0;
      const subtotal = (price - discount) * qty;

      return [
        (index + 1).toString(),
        product.name,
        `Rp ${this.formatCurrency(price)}`,
        qty.toString(),
        `Rp ${this.formatCurrency(discount)}`,
        `Rp ${this.formatCurrency(subtotal)}`,
      ];
    });

    autoTable(doc, {
      startY: tableStartY,
      head: [['No', 'Product Name', 'Price', 'Qty', 'Discount', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [76, 175, 80],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [50, 50, 50],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'left', cellWidth: 'auto' },
        2: { halign: 'right', cellWidth: 30 },
        3: { halign: 'center', cellWidth: 15 },
        4: { halign: 'right', cellWidth: 25 },
        5: { halign: 'right', cellWidth: 30 },
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 15, right: 15 },
    });

    // Payment Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const summaryX = pageWidth - 75;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Summary box
    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.rect(summaryX - 5, finalY - 5, 65, 35);

    doc.text('Subtotal:', summaryX, finalY);
    doc.text(`Rp ${orderData.subtotal}`, pageWidth - 15, finalY, {
      align: 'right',
    });

    doc.text('Discount:', summaryX, finalY + 6);
    doc.text(`Rp ${orderData.totalDiscount}`, pageWidth - 15, finalY + 6, {
      align: 'right',
    });

    doc.text('Delivery Fee:', summaryX, finalY + 12);
    doc.text(`Rp ${orderData.deliveryFee}`, pageWidth - 15, finalY + 12, {
      align: 'right',
    });

    // Total with background
    doc.setFillColor(76, 175, 80);
    doc.rect(summaryX - 5, finalY + 17, 65, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL:', summaryX, finalY + 23);
    doc.text(`Rp ${orderData.total}`, pageWidth - 15, finalY + 23, {
      align: 'right',
    });

    // Footer
    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    const footerY = doc.internal.pageSize.getHeight() - 20;

    doc.setDrawColor(200);
    doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);

    doc.text('Thank you for your order!', pageWidth / 2, footerY, {
      align: 'center',
    });
    doc.text(
      'For questions, contact us at support@gsolusi.id',
      pageWidth / 2,
      footerY + 5,
      { align: 'center' },
    );

    doc.setFontSize(7);
    doc.text(
      `Generated on: ${new Date().toLocaleString('id-ID')}`,
      pageWidth / 2,
      footerY + 10,
      { align: 'center' },
    );

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  }

  private formatCurrency(value: number): string {
    return value.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
  }

  /**
   * Load image from URL and convert to base64 for PDF embedding
   * @param url - Image URL to load
   * @returns Base64 string or null if failed
   */
  private async loadImageAsBase64(url: string): Promise<string | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { responseType: 'arraybuffer' }),
      );

      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      const mimeType = response.headers['content-type'] || 'image/png';

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error('Failed to load image from URL:', url, error);
      return null;
    }
  }
}

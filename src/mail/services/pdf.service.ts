import { Injectable } from '@nestjs/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IOrder } from '../interfaces/invoice.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  statusOrderToText,
  filterOrderProduct,
} from '../../../helpers/data.helper';
import { OrderProduct } from '@prisma/client';

@Injectable()
export class PdfService {
  constructor(private readonly httpService: HttpService) {}

  async generateInvoicePdf(orderData: IOrder): Promise<Buffer> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header dengan background biru
    doc.setFillColor(53, 169, 198); // Warna biru
    doc.rect(0, 0, pageWidth, 30, 'F');

    // Logo di tengah header (gunakan URL logo asli atau placeholder)
    const logoUrl = `https://picsum.photos/150/50`; // Sesuaikan dengan logo Anda

    try {
      const logoBase64 = await this.loadImageAsBase64(logoUrl);
      if (logoBase64) {
        // Logo di tengah
        const logoWidth = 30;
        const logoHeight = 20;
        doc.addImage(
          logoBase64,
          'PNG',
          (pageWidth - logoWidth) / 2,
          5,
          logoWidth,
          logoHeight,
        );
      }
    } catch (error) {
      // Fallback: text logo di tengah
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('G-SOLUSI', pageWidth / 2, 18, { align: 'center' });
    }

    // Title INVOICE
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('INVOICE', pageWidth / 2, 45, { align: 'center' });

    // Data Information Section
    const startY = 60;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Data Information', 15, startY);

    // Garis bawah Data Information
    doc.setDrawColor(53, 169, 198);
    doc.setLineWidth(0.5);
    doc.line(15, startY + 2, pageWidth - 15, startY + 2);

    // Data Information Content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);

    const infoStartY = startY + 12;
    const labelX = 15;
    const valueX = 50;

    // ID Order
    doc.text('ID Order', labelX, infoStartY);
    doc.text(':', labelX + 30, infoStartY);
    doc.text(orderData.trackId || '-', valueX, infoStartY);

    // Nama
    doc.text('Nama', labelX, infoStartY + 6);
    doc.text(':', labelX + 30, infoStartY + 6);
    doc.text(orderData.name || '-', valueX, infoStartY + 6);

    // Telp
    doc.text('Telp', labelX, infoStartY + 12);
    doc.text(':', labelX + 30, infoStartY + 12);
    doc.text(orderData.phoneNumber || '-', valueX, infoStartY + 12);

    // Email
    doc.text('Email', labelX, infoStartY + 18);
    doc.text(':', labelX + 30, infoStartY + 18);
    doc.text(orderData.email || '-', valueX, infoStartY + 18);

    // Alamat
    doc.text('Alamat', labelX, infoStartY + 24);
    doc.text(':', labelX + 30, infoStartY + 24);
    const address = `${orderData?.recipientAddress?.address},{" "}
            ${orderData?.recipientAddress?.province?.split('-')[0]},{" "}
            ${orderData?.recipientAddress?.subDistrict?.split('-')[0]},{" "}
            ${orderData?.recipientAddress?.suburbOrVillage?.split('-')[0]},{" "}
            ${orderData?.recipientAddress?.city?.split('-')[0]},{" "}
            ${orderData?.recipientAddress?.postalCode}`;

    const addressLines = doc.splitTextToSize(address, pageWidth - valueX - 20);
    doc.text(addressLines, valueX, infoStartY + 24);

    // Products Table
    const tableStartY = infoStartY + 40;

    const productData = filterOrderProduct(
      orderData?.orderProduct as OrderProduct[],
    );
    const tableData = productData.map((product: any) => {
      const price = parseFloat(product?.price) || 0;
      const qty = product?.quantity || 0;

      return [
        product?.bundleName || product?.name || '-',
        `Rp ${this.formatCurrency(price)}`,
        qty.toString(),
      ];
    });

    autoTable(doc, {
      startY: tableStartY,
      head: [['Product(s)', 'Price', 'QTY']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [53, 169, 198], // Warna biru untuk header
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 60 },
        2: { halign: 'center', cellWidth: 40 },
      },
      margin: { left: 15, right: 15, bottom: 40 },
      // Pastikan tabel bisa span ke page berikutnya jika produk banyak
      showHead: 'everyPage',
      // Minimum tinggi untuk row agar tidak terpotong
      rowPageBreak: 'auto',
      tableWidth: 'auto',
    });

    // Summary Section
    let finalY = (doc as any).lastAutoTable.finalY + 15;
    const pageHeight = doc.internal.pageSize.getHeight();

    // Cek apakah masih ada ruang untuk summary, jika tidak tambah halaman baru
    if (finalY + 30 > pageHeight - 20) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);

    // Total Tagihan
    doc.text('Total Tagihan :', 15, finalY);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `(Rp ${this.formatCurrency(orderData.totalPayment || 0)})`,
      pageWidth - 15,
      finalY,
      {
        align: 'right',
      },
    );

    // Status Tagihan
    doc.setFont('helvetica', 'normal');
    doc.text('Status Tagihan :', 15, finalY + 8);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `${statusOrderToText(orderData.status)}`,
      pageWidth - 15,
      finalY + 8,
      {
        align: 'right',
      },
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

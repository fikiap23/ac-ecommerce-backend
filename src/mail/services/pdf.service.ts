import { Injectable } from '@nestjs/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { statusOrderToText } from '../../../helpers/data.helper';
import { IOrder } from '../interfaces/invoice.interface';

@Injectable()
export class PdfService {
  constructor(private readonly httpService: HttpService) {}

  async generateInvoicePdf(orderData: IOrder): Promise<Buffer> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header dengan background biru
    doc.setFillColor(53, 169, 198); // Warna biru
    doc.rect(0, 0, pageWidth, 30, 'F');

    // ganti headerUrlnya
    const headerUrl = 'https://api.gsolusi.id/upload/asset/g-solusi-header.png';

    try {
      const headerBase64 = await this.loadImageAsBase64(headerUrl);
      if (headerBase64) {
        // Gambar header full width dengan tinggi proporsional
        const headerHeight = 45;

        // Set opacity menggunakan setGState dengan key yang benar
        doc.saveGraphicsState();
        const gState = new (doc as any).GState({ opacity: 0.4 });
        doc.setGState(gState);

        doc.addImage(headerBase64, 'PNG', 0, 0, pageWidth, headerHeight);

        // Restore graphics state
        doc.restoreGraphicsState();
      }
    } catch (error) {
      console.error('Failed to load header image:', error);
      // Fallback: tambahkan background biru jika gambar gagal load
      doc.setFillColor(43, 192, 228);
      doc.rect(0, 0, pageWidth, 25, 'F');
    }

    // Text informasi alamat dan kontak di bawah header
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150); // Abu-abu muda
    doc.text(
      'Ruko Capitol Plaza A2 - Jl. Jend. Sudirman No. 91 Bandung | +62 8990000588 | www.gsolusi.id',
      15,
      30,
      { align: 'left' },
    );

    // Title INVOICE
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('INVOICE', pageWidth / 2, 50, { align: 'center' });

    // Garis horizontal tipis
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.line(15, 53, pageWidth - 15, 53);

    // Data Information Section
    const startY = 60;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);

    const labelX = 15;
    const colonX = 50;
    const valueX = 55;

    // Tanggal
    doc.text('Tanggal', labelX, startY);
    doc.text(':', colonX, startY);
    doc.text(
      new Date(orderData.createdAt || Date.now()).toLocaleDateString('id-ID') ||
        '-',
      valueX,
      startY,
    );

    // ID Order
    doc.text('ID Order', labelX, startY + 6);
    doc.text(':', colonX, startY + 6);
    doc.text(orderData.id || '-', valueX, startY + 6);

    // Nama
    doc.text('Nama', labelX, startY + 12);
    doc.text(':', colonX, startY + 12);
    doc.text(orderData.name || '-', valueX, startY + 12);

    // Telp
    doc.text('Telp', labelX, startY + 18);
    doc.text(':', colonX, startY + 18);
    doc.text(orderData.phone || '-', valueX, startY + 18);

    // Email
    doc.text('Email', labelX, startY + 24);
    doc.text(':', colonX, startY + 24);
    doc.text(orderData.email || '-', valueX, startY + 24);

    // Alamat Pengiriman
    doc.text('Alamat Pengiriman', labelX, startY + 30);
    doc.text(':', colonX, startY + 30);
    const addressLines = doc.splitTextToSize(
      orderData.address,
      pageWidth - valueX - 20,
    );
    doc.text(addressLines, valueX, startY + 30);

    // Products Table
    const tableStartY = startY + 42;

    const productData = orderData?.products || [];
    const tableData = productData.map((product) => {
      const price = parseFloat(product?.price) || 0;
      const qty = product?.qty || 0;
      const total = price * qty;

      return [
        product?.name || product?.name || '-',
        qty.toString(),
        `Rp ${this.formatCurrency(price)}`,
        `Rp ${this.formatCurrency(total)}`,
      ];
    });

    autoTable(doc, {
      startY: tableStartY,
      head: [['BARANG', 'QTY', 'HARGA', 'JUMLAH']],
      body: tableData,
      foot: [
        [
          {
            content: 'Terbilang :',
            rowSpan: 2,
            styles: { valign: 'top', fontSize: 9 },
          },
          '',
          {
            content: 'TOTAL',
            rowSpan: 2,
            styles: {
              valign: 'middle',
              fontSize: 11,
              fontStyle: 'bold',
              halign: 'left',
              fillColor: [43, 192, 228],
            },
          },
          {
            content: `Rp ${this.formatCurrency(Number(orderData.total) || 0)}`,
            rowSpan: 2,
            styles: {
              valign: 'middle',
              fontSize: 11,
              fontStyle: 'bold',
              halign: 'center',
              fillColor: [43, 192, 228],
            },
          },
        ],
        ['', '', '', ''],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [43, 192, 228], // Warna biru untuk header
        textColor: [0, 0, 0],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [0, 0, 0],
      },
      footStyles: {
        fillColor: [255, 255, 255], // Default putih
        textColor: [0, 0, 0],
        fontSize: 9,
        fontStyle: 'normal',
        halign: 'left',
        lineWidth: 0.1,
        lineColor: [200, 200, 200], // Abu-abu muda sama seperti table body
        minCellHeight: 7, // Tinggi per row dikecilkan
        cellPadding: 2, // Padding lebih kecil
        valign: 'top',
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'center', cellWidth: 45 },
        3: { halign: 'center', cellWidth: 45 },
      },
      margin: { left: 15, right: 15, bottom: 40 },
      showHead: 'everyPage',
      showFoot: 'lastPage',
      rowPageBreak: 'auto',
      tableWidth: 'auto',
      didParseCell: (data: any) => {
        if (data.section === 'foot') {
          // Row pertama: Merge Terbilang dengan kolom BARANG dan QTY (kolom 0 dan 1)
          if (data.row.index === 0 && data.column.index === 0) {
            data.cell.colSpan = 2;
          }
          // Hide kolom 1 di row pertama karena sudah di-merge dengan kolom 0
          if (data.row.index === 0 && data.column.index === 1) {
            // Cell ini akan di-hide oleh colSpan
          }
        }
      },
      willDrawCell: (data: any) => {
        if (data.section === 'foot') {
          // Row pertama: style normal
          if (data.row.index === 0) {
            data.cell.styles.textColor = [0, 0, 0];
          }
          // Row kedua sudah otomatis di-hide karena rowSpan
        }
      },
    });

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

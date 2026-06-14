import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Logger } from '../utils/logger';
import { PassThrough } from 'stream';

export class ExportService {
  /**
   * Generates a CSV string from an array of JSON objects.
   */
  public static generateCSV(data: any[], fields: string[]): string {
    try {
      const json2csvParser = new Parser({ fields });
      return json2csvParser.parse(data);
    } catch (err) {
      Logger.error('Error generating CSV:', err);
      throw new Error('Failed to generate CSV export');
    }
  }

  /**
   * Generates an Excel (XLSX) buffer from an array of JSON objects.
   */
  public static async generateExcel(data: any[], sheetName: string = 'Report'): Promise<Buffer> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      if (data.length > 0) {
        // Generate headers dynamically based on keys of the first object
        worksheet.columns = Object.keys(data[0]).map(key => ({
          header: key.toUpperCase(),
          key: key,
          width: 20
        }));

        // Add rows
        worksheet.addRows(data);
        
        // Style Header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF97316' } // Brand Orange
        };
      }

      // Buffer conversion
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer as any as Buffer;
    } catch (err) {
      Logger.error('Error generating Excel:', err);
      throw new Error('Failed to generate Excel export');
    }
  }

  /**
   * Generates a simple PDF document buffer from tabular data.
   */
  public static async generatePDF(title: string, data: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        const buffers: Buffer[] = [];
        const stream = new PassThrough();

        doc.pipe(stream);
        
        stream.on('data', chunk => buffers.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(buffers)));

        // Write Title
        doc.fontSize(20).text(title, { align: 'center' });
        doc.moveDown();

        // Write basic tabular text (In production, use pdfkit-table or puppeteer)
        doc.fontSize(10);
        data.forEach((row, idx) => {
          doc.text(`${idx + 1}. ${JSON.stringify(row)}`);
          doc.moveDown(0.5);
        });

        doc.end();
      } catch (err) {
        Logger.error('Error generating PDF:', err);
        reject(err);
      }
    });
  }
}

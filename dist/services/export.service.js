"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const json2csv_1 = require("json2csv");
const exceljs_1 = __importDefault(require("exceljs"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const logger_1 = require("../utils/logger");
const stream_1 = require("stream");
class ExportService {
    /**
     * Generates a CSV string from an array of JSON objects.
     */
    static generateCSV(data, fields) {
        try {
            const json2csvParser = new json2csv_1.Parser({ fields });
            return json2csvParser.parse(data);
        }
        catch (err) {
            logger_1.Logger.error('Error generating CSV:', err);
            throw new Error('Failed to generate CSV export');
        }
    }
    /**
     * Generates an Excel (XLSX) buffer from an array of JSON objects.
     */
    static generateExcel(data_1) {
        return __awaiter(this, arguments, void 0, function* (data, sheetName = 'Report') {
            try {
                const workbook = new exceljs_1.default.Workbook();
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
                const buffer = yield workbook.xlsx.writeBuffer();
                return buffer;
            }
            catch (err) {
                logger_1.Logger.error('Error generating Excel:', err);
                throw new Error('Failed to generate Excel export');
            }
        });
    }
    /**
     * Generates a simple PDF document buffer from tabular data.
     */
    static generatePDF(title, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    const doc = new pdfkit_1.default({ margin: 30, size: 'A4' });
                    const buffers = [];
                    const stream = new stream_1.PassThrough();
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
                }
                catch (err) {
                    logger_1.Logger.error('Error generating PDF:', err);
                    reject(err);
                }
            });
        });
    }
}
exports.ExportService = ExportService;

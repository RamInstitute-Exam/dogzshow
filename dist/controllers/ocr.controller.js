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
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractKciData = void 0;
const ocr_service_1 = require("../services/ocr.service");
const extractKciData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // In production, this would be the URL or buffer from Multer/S3
        const dummyImageUrl = req.body.imageUrl || 'dummy-image-url.jpg';
        const extractedData = yield ocr_service_1.OcrService.processKciCertificate(dummyImageUrl);
        // Log the OCR extraction to the database (requires Prisma)
        /*
        await prisma.oCRLog.create({
          data: {
            documentUrl: dummyImageUrl,
            extractedData: JSON.stringify(extractedData),
            status: 'SUCCESS'
          }
        });
        */
        res.status(200).json({
            success: true,
            message: 'KCI Certificate parsed successfully',
            data: extractedData
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
exports.extractKciData = extractKciData;

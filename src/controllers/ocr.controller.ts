import { Request, Response } from 'express';
import { OcrService } from '../services/ocr.service';

export const extractKciData = async (req: Request, res: Response): Promise<void> => {
  try {
    // In production, this would be the URL or buffer from Multer/S3
    const dummyImageUrl = req.body.imageUrl || 'dummy-image-url.jpg';
    
    const extractedData = await OcrService.processKciCertificate(dummyImageUrl);
    
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

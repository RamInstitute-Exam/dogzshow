import { Request, Response } from 'express';
import { CertificateService } from '../services/certificate.service';

const certificateService = new CertificateService();

export const getUserKciCertificates = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const result = await certificateService.getUserCertificates(userId, req.query);
    res.status(200).json({
      success: true,
      message: 'User KCI certificates retrieved successfully',
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminKciCertificates = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await certificateService.getAdminCertificates(req.query);
    res.status(200).json({
      success: true,
      message: 'Admin KCI certificates retrieved successfully',
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyKciCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).user?.id || 'SYSTEM';
    const { status, kciNumber } = req.body;
    
    if (!status) {
      res.status(400).json({ success: false, message: 'Status is required' });
      return;
    }

    const data = await certificateService.verifyCertificate(req.params.id as string, status, adminId, kciNumber);
    res.status(200).json({ success: true, message: `Certificate ${status.toLowerCase()} successfully`, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

import { Request, Response } from 'express';
import { AuditLogger } from '../utils/audit.logger';
import { PaymentService } from '../services/payment.service';

const paymentService = new PaymentService();

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { registrationId, amount } = req.body;
    
    if (!registrationId || !amount) {
      res.status(400).json({ success: false, message: 'registrationId and amount are required' });
      return;
    }

    const data = await paymentService.createOrder({ registrationId, amount, userId });
    res.status(201).json({ success: true, message: 'Order created successfully', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ success: false, message: 'Invalid payment verification payload' });
      return;
    }

    const data = await paymentService.verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
    res.status(200).json(data);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await paymentService.getTransactions(req.query);
    res.status(200).json({
      success: true,
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

export const getRefunds = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await paymentService.getRefunds(req.query);
    res.status(200).json({
      success: true,
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

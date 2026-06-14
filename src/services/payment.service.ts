import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../prisma';

export class PaymentService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
    });
  }

  async createOrder(data: { registrationId: string, amount: number, userId: string }) {
    const { registrationId, amount, userId } = data;

    const reg = await prisma.eventRegistration.findUnique({ where: { id: registrationId } });
    if (!reg) throw new Error('Registration not found');

    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `rcpt_${registrationId.slice(0, 10)}`
    };

    const order = await this.razorpay.orders.create(options);

    const payment = await prisma.payment.create({
      data: {
        registrationId,
        userId,
        amount,
        currency: 'INR',
        status: 'PENDING',
        transactionId: order.id,
        paymentGateway: 'RAZORPAY'
      }
    });

    await prisma.paymentLog.create({
      data: {
        paymentId: payment.id,
        status: 'ORDER_CREATED',
        responsePayload: order as any
      }
    });

    return { order, paymentId: payment.id };
  }

  async verifyPayment(data: { razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    const payment = await prisma.payment.findUnique({
      where: { transactionId: razorpay_order_id }
    });

    if (!payment) throw new Error('Payment record not found');

    const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCESS', transactionId: razorpay_payment_id }
      });

      await prisma.eventRegistration.update({
        where: { id: payment.registrationId },
        data: { status: 'CONFIRMED' }
      });

      await prisma.paymentLog.create({
        data: {
          paymentId: payment.id,
          status: 'SUCCESS',
          responsePayload: data as any
        }
      });

      return { success: true, message: 'Payment verified successfully' };
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      await prisma.paymentLog.create({
        data: {
          paymentId: payment.id,
          status: 'FAILED_VERIFICATION',
          responsePayload: data as any
        }
      });

      throw new Error('Payment verification failed');
    }
  }

  async getTransactions(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: true, registration: { include: { event: true, dog: true } } }
      }),
      prisma.payment.count()
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getRefunds(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    const [data, total] = await Promise.all([
      prisma.refund.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { payment: { include: { user: true } } }
      }),
      prisma.refund.count()
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

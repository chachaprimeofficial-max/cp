import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './payment.schema';
import { Order, OrderDocument } from '../orders/order.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private readonly payments: Model<PaymentDocument>,
    @InjectModel(Order.name) private readonly orders: Model<OrderDocument>,
  ) {}

  async createCheckout(userId: string, dto: CreatePaymentDto) {
    const order = await this.orders.findOne({ userId, orderNumber: dto.orderNumber }).lean();
    if (!order) throw new NotFoundException('Order not found.');
    if (order.paymentStatus === 'paid') throw new BadRequestException('This order is already paid.');

    const existing = await this.payments.findOne({
      orderNumber: order.orderNumber,
      userId,
      status: { $in: ['pending', 'authorized'] },
    }).lean();

    if (existing) {
      return {
        transactionId: existing.transactionId,
        orderNumber: existing.orderNumber,
        amount: existing.amount,
        currency: existing.currency,
        method: existing.method,
        status: existing.status,
        provider: existing.provider || 'external',
        providerReady: false,
        message: 'Payment provider credentials are not configured yet.',
      };
    }

    const transactionId = `CP-PAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const payment = await this.payments.create({
      transactionId,
      orderNumber: order.orderNumber,
      userId,
      amount: order.total,
      currency: dto.currency || 'GBP',
      method: dto.method,
      status: 'pending',
      provider: 'external',
    });

    return {
      transactionId: payment.transactionId,
      orderNumber: payment.orderNumber,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      provider: payment.provider,
      providerReady: false,
      message: 'Payment intent created. Connect the selected provider to authorize the payment.',
    };
  }

  mine(userId: string) {
    return this.payments.find({ userId }).sort({ createdAt: -1 }).limit(100).lean();
  }
}
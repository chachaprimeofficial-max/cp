import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Refund, RefundDocument } from './refund.schema';
import { Order, OrderDocument } from '../orders/order.schema';
import { CreateRefundDto } from './dto/create-refund.dto';

@Injectable()
export class RefundsService {
  constructor(
    @InjectModel(Refund.name) private readonly refunds: Model<RefundDocument>,
    @InjectModel(Order.name) private readonly orders: Model<OrderDocument>,
  ) {}

  async createRequest(userId: string, dto: CreateRefundDto) {
    const order = await this.orders.findOne({ userId, orderNumber: dto.orderNumber }).lean();
    if (!order) throw new NotFoundException('Order not found.');
    if (!['paid', 'completed', 'delivered'].includes(order.paymentStatus) && order.status !== 'delivered') {
      throw new BadRequestException('This order is not eligible for a refund request yet.');
    }

    const existing = await this.refunds.findOne({
      userId,
      orderNumber: order.orderNumber,
      status: { $in: ['requested', 'approved', 'processing', 'completed'] },
    }).lean();
    if (existing) throw new BadRequestException('A refund request already exists for this order.');

    const amount = Math.min(Math.max(dto.amount ?? order.total, 0), order.total);
    if (amount <= 0) throw new BadRequestException('Refund amount must be greater than zero.');

    const refundNumber = `CP-REF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    return this.refunds.create({
      refundNumber,
      orderNumber: order.orderNumber,
      userId,
      amount,
      reason: dto.reason.trim(),
      status: 'requested',
      refundMethod: 'wallet',
    });
  }

  mine(userId: string) {
    return this.refunds.find({ userId }).sort({ createdAt: -1 }).limit(100).lean();
  }
}
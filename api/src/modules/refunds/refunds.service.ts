import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Refund, RefundDocument } from './refund.schema';
import { Order, OrderDocument } from '../orders/order.schema';
import { CreateRefundDto } from './dto/create-refund.dto';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class RefundsService {
  constructor(
    @InjectModel(Refund.name) private readonly refunds: Model<RefundDocument>,
    @InjectModel(Order.name) private readonly orders: Model<OrderDocument>,
    private readonly wallet: WalletService,
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

  adminList(status?: string) {
    const filter = status ? { status } : {};
    return this.refunds.find(filter).sort({ createdAt: -1 }).limit(100).lean();
  }

  async approve(refundNumber: string, adminNote?: string) {
    const updated = await this.refunds.findOneAndUpdate(
      { refundNumber, status: 'requested' },
      { status: 'approved', ...(adminNote ? { adminNote: adminNote.trim() } : {}) },
      { new: true },
    ).lean();
    if (!updated) throw new BadRequestException('Refund must be in requested status.');
    return updated;
  }

  async reject(refundNumber: string, adminNote?: string) {
    const updated = await this.refunds.findOneAndUpdate(
      { refundNumber, status: 'requested' },
      { status: 'rejected', ...(adminNote ? { adminNote: adminNote.trim() } : {}) },
      { new: true },
    ).lean();
    if (!updated) throw new BadRequestException('Refund must be in requested status.');
    return updated;
  }

  async complete(refundNumber: string) {
    const refund = await this.refunds.findOne({ refundNumber }).lean();
    if (!refund) throw new NotFoundException('Refund not found.');
    if (refund.status === 'completed') throw new BadRequestException('Refund is already completed.');
    if (refund.status !== 'approved') throw new BadRequestException('Refund must be approved before completion.');
    await this.wallet.credit(refund.userId, refund.amount, 'refund', refund.refundNumber, `Refund for order ${refund.orderNumber}`);
    const updated = await this.refunds.findOneAndUpdate({ refundNumber, status: 'approved' }, { status: 'completed', completedAt: new Date() }, { new: true }).lean();
    if (!updated) throw new BadRequestException('Refund status changed before completion.');
    return updated;
  }

  mine(userId: string) {
    return this.refunds.find({ userId }).sort({ createdAt: -1 }).limit(100).lean();
  }
}
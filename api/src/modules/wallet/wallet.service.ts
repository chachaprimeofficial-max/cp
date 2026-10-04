import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';
import { WalletLedger, WalletLedgerDocument } from './wallet-ledger.schema';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
    @InjectModel(WalletLedger.name) private readonly ledger: Model<WalletLedgerDocument>,
  ) {}

  async getWallet(userId: string) {
    const user = await this.users.findById(userId).select('walletBalance').lean();
    if (!user) throw new NotFoundException('User not found.');
    const entries = await this.ledger.find({ userId }).sort({ createdAt: -1 }).limit(100).lean();
    return { balance: user.walletBalance || 0, entries };
  }

  async credit(userId: string, amount: number, type: string, reference?: string, note?: string) {
    if (!Number.isFinite(amount) || amount <= 0) throw new BadRequestException('Wallet credit must be greater than zero.');
    const user = await this.users.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: amount } },
      { new: true, runValidators: true },
    ).select('walletBalance').lean();
    if (!user) throw new NotFoundException('User not found.');
    const balanceAfter = user.walletBalance || 0;
    await this.ledger.create({ userId, type, amount, balanceAfter, reference, note });
    return { balance: balanceAfter };
  }

  async debit(userId: string, amount: number, type: string, reference?: string, note?: string) {
    if (!Number.isFinite(amount) || amount <= 0) throw new BadRequestException('Wallet debit must be greater than zero.');
    const user = await this.users.findOneAndUpdate(
      { _id: userId, walletBalance: { $gte: amount } },
      { $inc: { walletBalance: -amount } },
      { new: true, runValidators: true },
    ).select('walletBalance').lean();
    if (!user) throw new BadRequestException('Insufficient wallet balance.');
    const balanceAfter = user.walletBalance || 0;
    await this.ledger.create({ userId, type, amount: -amount, balanceAfter, reference, note });
    return { balance: balanceAfter };
  }
}
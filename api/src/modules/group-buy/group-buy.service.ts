import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroupBuy, GroupBuyDocument } from './group-buy.schema';
import { Product, ProductDocument } from '../products/product.schema';
import { WalletService } from '../wallet/wallet.service';
import { CreateGroupBuyDto } from './dto/create-group-buy.dto';

@Injectable()
export class GroupBuyService {
  constructor(
    @InjectModel(GroupBuy.name) private readonly groups: Model<GroupBuyDocument>,
    @InjectModel(Product.name) private readonly products: Model<ProductDocument>,
    private readonly wallet: WalletService,
  ) {}

  async create(userId: string, dto: CreateGroupBuyDto) {
    const product = await this.products.findOne({ _id: dto.productId, isActive: true }).lean();
    if (!product) throw new NotFoundException('Product not found.');
    if (dto.contributionAmount <= 0 || dto.targetAmount <= 0 || dto.contributionAmount > dto.targetAmount) throw new BadRequestException('Invalid group contribution.');
    const groupNumber = `CP-GB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    await this.groups.create({ groupNumber, productId: dto.productId, productName: product.name, targetAmount: dto.targetAmount, contributionAmount: dto.contributionAmount, targetMembers: dto.targetMembers, expiresAt: new Date(Date.now() + dto.expiresInHours * 3600000), members: [] });
    return this.join(groupNumber, userId);
  }

  async join(groupNumber: string, userId: string) {
    const group = await this.groups.findOne({ groupNumber }).lean();
    if (!group) throw new NotFoundException('Group buy not found.');
    if (group.status !== 'open' || new Date(group.expiresAt).getTime() <= Date.now()) throw new BadRequestException('This group buy is no longer open.');
    if (group.members.some((member) => member.userId === userId)) throw new BadRequestException('You already joined this group.');
    if (group.members.length >= group.targetMembers) throw new BadRequestException('This group is full.');

    const contribution = group.contributionAmount;
    await this.wallet.debit(userId, contribution, 'group_buy', groupNumber, `Group buy contribution for ${group.productName}`);

    const updated = await this.groups.findOneAndUpdate(
      { groupNumber, status: 'open', expiresAt: { $gt: new Date() }, 'members.userId': { $ne: userId }, $expr: { $lt: [{ $size: '$members' }, '$targetMembers'] } },
      { $push: { members: { userId, amount: contribution, paymentStatus: 'paid', joinedAt: new Date() } } },
      { new: true },
    ).lean();

    if (!updated) {
      await this.wallet.credit(userId, contribution, 'group_buy_join_rollback', `${groupNumber}:join-rollback:${userId}`, `Group buy join could not be completed for ${groupNumber}`);
      throw new BadRequestException('The group changed while you were joining. Your contribution was returned to your wallet.');
    }

    const total = updated.members.reduce((sum, member) => sum + member.amount, 0);
    if (total >= updated.targetAmount || updated.members.length >= updated.targetMembers) {
      return this.groups.findOneAndUpdate({ groupNumber, status: 'open' }, { status: 'funded' }, { new: true }).lean();
    }
    return updated;
  }

  async expireFailedGroups() {
    const groups = await this.groups.find({ status: 'open', expiresAt: { $lte: new Date() } }).limit(100).lean();
    let refundedGroups = 0;
    let refundedMembers = 0;
    for (const group of groups) {
      const locked = await this.groups.findOneAndUpdate({ _id: group._id, status: 'open' }, { status: 'expired' }, { new: true }).lean();
      if (!locked) continue;
      for (const member of locked.members.filter((item) => item.paymentStatus === 'paid')) {
        await this.wallet.credit(member.userId, member.amount, 'group_buy_refund', `${locked.groupNumber}:refund:${member.userId}`, `Group buy failed; refund for ${locked.productName}`);
        refundedMembers += 1;
      }
      await this.groups.updateOne({ _id: locked._id }, { $set: { 'members.$[member].paymentStatus': 'refunded' } }, { arrayFilters: [{ 'member.paymentStatus': 'paid' }] });
      refundedGroups += 1;
    }
    return { refundedGroups, refundedMembers };
  }

  async listAdmin() { return this.groups.find().sort({ createdAt: -1 }).limit(100).lean(); }

  async mine(userId: string) { return this.groups.find({ 'members.userId': userId }).sort({ createdAt: -1 }).limit(100).lean(); }
  async listOpen() { return this.groups.find({ status: 'open', expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 }).limit(100).lean(); }
}

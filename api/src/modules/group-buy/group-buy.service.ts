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
    if (dto.contributionAmount <= 0 || dto.targetAmount <= 0 || dto.contributionAmount > dto.targetAmount) {
      throw new BadRequestException('Invalid group contribution.');
    }
    const groupNumber = `CP-GB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const group = await this.groups.create({
      groupNumber,
      productId: dto.productId,
      productName: product.name,
      targetAmount: dto.targetAmount,
      contributionAmount: dto.contributionAmount,
      targetMembers: dto.targetMembers,
      expiresAt: new Date(Date.now() + dto.expiresInHours * 3600000),
      members: [],
    });
    return this.join(group.groupNumber, userId);
  }

  async join(groupNumber: string, userId: string) {
    const group = await this.groups.findOne({ groupNumber }).lean();
    if (!group) throw new NotFoundException('Group buy not found.');
    if (group.status !== 'open' || new Date(group.expiresAt).getTime() <= Date.now()) {
      throw new BadRequestException('This group buy is no longer open.');
    }
    if (group.members.some((member) => member.userId === userId)) throw new BadRequestException('You already joined this group.');
    if (group.members.length >= group.targetMembers) throw new BadRequestException('This group is full.');
    await this.wallet.debit(userId, group.contributionAmount, 'group_buy', groupNumber, `Group buy contribution for ${group.productName}`);
    const members = [...group.members, { userId, amount: group.contributionAmount, paymentStatus: 'paid', joinedAt: new Date() }];
    const total = members.reduce((sum, member) => sum + member.amount, 0);
    const status = total >= group.targetAmount || members.length >= group.targetMembers ? 'funded' : 'open';
    return this.groups.findOneAndUpdate({ groupNumber, status: 'open' }, { members, status }, { new: true }).lean();
  }

  async mine(userId: string) {
    return this.groups.find({ 'members.userId': userId }).sort({ createdAt: -1 }).limit(100).lean();
  }

  async listOpen() {
    return this.groups.find({ status: 'open', expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 }).limit(100).lean();
  }
}

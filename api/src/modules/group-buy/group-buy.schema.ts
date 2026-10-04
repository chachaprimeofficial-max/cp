import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GroupBuyDocument = HydratedDocument<GroupBuy>;

@Schema({ _id: false })
export class GroupBuyMember {
  @Prop({ required: true }) userId: string;
  @Prop({ required: true, min: 0 }) amount: number;
  @Prop({ enum: ['pending', 'paid', 'refunded'], default: 'pending' }) paymentStatus: string;
  @Prop() joinedAt?: Date;
}

@Schema({ timestamps: true })
export class GroupBuy {
  @Prop({ required: true, unique: true, index: true }) groupNumber: string;
  @Prop({ required: true, index: true }) productId: string;
  @Prop({ required: true }) productName: string;
  @Prop({ required: true, min: 0 }) targetAmount: number;
  @Prop({ required: true, min: 0 }) contributionAmount: number;
  @Prop({ required: true, min: 1 }) targetMembers: number;
  @Prop({ type: [GroupBuyMember], default: [] }) members: GroupBuyMember[];
  @Prop({ enum: ['open', 'funded', 'expired', 'cancelled'], default: 'open', index: true }) status: string;
  @Prop({ required: true }) expiresAt: Date;
}

export const GroupBuySchema = SchemaFactory.createForClass(GroupBuy);
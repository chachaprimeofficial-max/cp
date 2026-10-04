import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RefundDocument = HydratedDocument<Refund>;

@Schema({ timestamps: true })
export class Refund {
  @Prop({ required: true, unique: true, index: true }) refundNumber: string;
  @Prop({ required: true, index: true }) orderNumber: string;
  @Prop({ required: true, index: true }) userId: string;
  @Prop({ required: true, min: 0 }) amount: number;
  @Prop({ required: true }) reason: string;
  @Prop({ enum: ['requested', 'approved', 'rejected', 'processing', 'completed', 'cancelled'], default: 'requested', index: true }) status: string;
  @Prop({ enum: ['wallet', 'original_payment'], default: 'wallet' }) refundMethod: string;
  @Prop() adminNote?: string;
  @Prop() completedAt?: Date;
}

export const RefundSchema = SchemaFactory.createForClass(Refund);
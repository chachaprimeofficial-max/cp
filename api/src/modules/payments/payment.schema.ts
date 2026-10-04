import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true, index: true, unique: true }) transactionId: string;
  @Prop({ required: true, index: true }) orderNumber: string;
  @Prop({ required: true, index: true }) userId: string;
  @Prop({ required: true, min: 0 }) amount: number;
  @Prop({ required: true, default: 'GBP' }) currency: string;
  @Prop({ required: true, enum: ['card', 'paypal', 'wallet'] }) method: string;
  @Prop({ required: true, enum: ['pending', 'authorized', 'paid', 'failed', 'refunded', 'cancelled'], default: 'pending' }) status: string;
  @Prop() provider?: string;
  @Prop() providerPaymentId?: string;
  @Prop() failureReason?: string;
  @Prop() paidAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
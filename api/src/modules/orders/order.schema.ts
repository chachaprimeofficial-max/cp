import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; import { HydratedDocument } from 'mongoose';
export type OrderDocument=HydratedDocument<Order>;
@Schema({_id:false}) export class OrderItem{@Prop({required:true}) productId:string;@Prop({required:true}) name:string;@Prop({required:true,min:1}) quantity:number;@Prop({required:true,min:0}) unitPrice:number;}
@Schema({timestamps:true}) export class Order{
 @Prop({required:true,index:true,unique:true}) orderNumber:string;
 @Prop({required:true,index:true}) userId:string;
 @Prop({type:[OrderItem],default:[]}) items:OrderItem[];
 @Prop({required:true,min:0}) subtotal:number;
 @Prop({default:0,min:0}) shipping:number;
 @Prop({default:0,min:0}) discount:number;
 @Prop({required:true,min:0}) total:number;
 @Prop({default:'pending',index:true}) status:string;
 @Prop({default:'pending'}) paymentStatus:string;
 @Prop() paymentMethod:string;
 @Prop() couponCode:string;
 @Prop() shippingAddress:Record<string,unknown>;
}
export const OrderSchema=SchemaFactory.createForClass(Order);
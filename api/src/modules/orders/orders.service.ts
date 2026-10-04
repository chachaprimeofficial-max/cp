import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../products/product.schema';
import { Order, OrderDocument } from './order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { CouponsService } from '../coupons/coupons.service';
import { Coupon, CouponDocument } from '../coupons/coupon.schema';

@Injectable()
export class OrdersService {
 constructor(
  @InjectModel(Order.name) private readonly orders:Model<OrderDocument>,
  @InjectModel(Product.name) private readonly products:Model<Product>,
  @InjectModel(Coupon.name) private readonly coupons:Model<CouponDocument>,
  private readonly couponService:CouponsService,
 ) {}

 async create(userId:string,dto:CreateOrderDto){
  if(!dto.items?.length) throw new BadRequestException('At least one product is required.');
  const requested=new Map<string,number>();
  for(const item of dto.items) requested.set(item.productId,(requested.get(item.productId)||0)+item.quantity);
  const reserved:Array<{productId:string;quantity:number}>=[]; const orderItems:Array<{productId:string;name:string;quantity:number;unitPrice:number}>=[];
  try{
   for(const [productId,quantity] of requested){
    const product=await this.products.findOneAndUpdate({_id:productId,isActive:true,stock:{$gte:quantity}},{$inc:{stock:-quantity}},{new:true}).lean();
    if(!product) throw new BadRequestException('One or more products are unavailable or out of stock.');
    reserved.push({productId,quantity}); orderItems.push({productId:product._id.toString(),name:product.name,quantity,unitPrice:product.price});
   }
   const subtotal=orderItems.reduce((sum,item)=>sum+item.unitPrice*item.quantity,0);
   const shipping=subtotal>=100?0:7.99;
   let discount=0; let couponCode:string|undefined;
   if(dto.couponCode){const result=await this.couponService.validate(dto.couponCode,subtotal);discount=result.discount;couponCode=result.code;}
   const total=Math.max(0,subtotal+shipping-discount);
   const orderNumber=`CP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
   const order=await this.orders.create({orderNumber,userId,items:orderItems,subtotal,shipping,discount,total,status:'pending',paymentStatus:'pending',shippingAddress:dto.shippingAddress,couponCode});
   if(couponCode) await this.coupons.updateOne({code:couponCode},{$inc:{usedCount:1}}).exec();
   return order;
  }catch(error){for(const item of reserved) await this.products.updateOne({_id:item.productId},{$inc:{stock:item.quantity}}).exec();throw error;}
 }
 mine(userId:string){return this.orders.find({userId}).sort({createdAt:-1}).lean();}
 async findOne(userId:string,orderNumber:string){const order=await this.orders.findOne({userId,orderNumber}).lean();if(!order)throw new NotFoundException('Order not found.');return order;}
 adminList(status?:string){return this.orders.find(status?{status}:{}).sort({createdAt:-1}).limit(100).lean();}
 async adminUpdateStatus(orderNumber:string,status:string){const order=await this.orders.findOneAndUpdate({orderNumber},{status},{new:true,runValidators:true}).lean();if(!order)throw new NotFoundException('Order not found.');return order;}
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from './coupon.schema';

@Injectable()
export class CouponsService {
  constructor(@InjectModel(Coupon.name) private readonly coupons: Model<CouponDocument>) {}
  async validate(code:string, subtotal:number) {
    const coupon=await this.coupons.findOne({code:code.trim().toUpperCase(),isActive:true}).lean();
    if(!coupon) throw new BadRequestException('Coupon is invalid.');
    if(coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) throw new BadRequestException('Coupon has expired.');
    if(coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) throw new BadRequestException('Coupon usage limit reached.');
    if(subtotal < coupon.minimumOrder) throw new BadRequestException(`Minimum order is £${coupon.minimumOrder.toFixed(2)}.`);
    const discount=coupon.type==='percentage' ? subtotal*(coupon.value/100) : coupon.value;
    return {code:coupon.code,type:coupon.type,value:coupon.value,discount:Math.min(subtotal,Math.max(0,discount))};
  }
}

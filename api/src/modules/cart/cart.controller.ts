import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from './cart.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateCartDto } from './dto/update-cart.dto';

type AuthenticatedRequest = Request & { user: { sub: string } };

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(@InjectModel(Cart.name) private readonly model: Model<Cart>) {}

  @Get()
  get(@Req() req: AuthenticatedRequest) {
    return this.model.findOne({ userId: req.user.sub }).lean();
  }

  @Post()
  async save(@Req() req: AuthenticatedRequest, @Body() dto: UpdateCartDto) {
    const subtotal = dto.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    return this.model.findOneAndUpdate(
      { userId: req.user.sub },
      { userId: req.user.sub, items: dto.items, subtotal },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
  }
}

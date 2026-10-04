import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wishlist } from './wishlist.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

type AuthenticatedRequest = Request & { user: { sub: string } };

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(@InjectModel(Wishlist.name) private readonly model: Model<Wishlist>) {}

  @Get()
  get(@Req() req: AuthenticatedRequest) {
    return this.model.findOne({ userId: req.user.sub }).lean();
  }

  @Post()
  save(@Req() req: AuthenticatedRequest, @Body() dto: UpdateWishlistDto) {
    return this.model.findOneAndUpdate(
      { userId: req.user.sub },
      { userId: req.user.sub, productIds: dto.productIds },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
  }
}

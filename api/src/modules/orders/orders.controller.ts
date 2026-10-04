import { Controller, Get, Param, Post, Req, UseGuards, Body } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

type AuthenticatedRequest = Request & { user: { sub: string } };

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateOrderDto) {
    return this.orders.create(req.user.sub, dto);
  }

  @Get('mine')
  mine(@Req() req: AuthenticatedRequest) {
    return this.orders.mine(req.user.sub);
  }

  @Get(':orderNumber')
  findOne(@Req() req: AuthenticatedRequest, @Param('orderNumber') orderNumber: string) {
    return this.orders.findOne(req.user.sub, orderNumber);
  }
}

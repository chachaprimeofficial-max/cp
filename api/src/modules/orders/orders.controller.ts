import { Body, Controller, Get, Param, Post, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
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

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, AdminGuard)
  adminList(@Query('status') status?: string) {
    return this.orders.adminList(status);
  }

  @Patch('admin/:orderNumber/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  adminUpdateStatus(@Param('orderNumber') orderNumber: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orders.adminUpdateStatus(orderNumber, dto.status);
  }

  @Get(':orderNumber')
  findOne(@Req() req: AuthenticatedRequest, @Param('orderNumber') orderNumber: string) {
    return this.orders.findOne(req.user.sub, orderNumber);
  }
}

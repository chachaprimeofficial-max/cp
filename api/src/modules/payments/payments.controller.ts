import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

type AuthenticatedRequest = Request & { user: { sub: string } };

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('checkout')
  createCheckout(@Req() req: AuthenticatedRequest, @Body() dto: CreatePaymentDto) {
    return this.payments.createCheckout(req.user.sub, dto);
  }

  @Get('mine')
  mine(@Req() req: AuthenticatedRequest) {
    return this.payments.mine(req.user.sub);
  }
}
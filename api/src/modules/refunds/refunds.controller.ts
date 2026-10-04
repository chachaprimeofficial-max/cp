import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';

type AuthenticatedRequest = Request & { user: { sub: string } };

@UseGuards(JwtAuthGuard)
@Controller('refunds')
export class RefundsController {
  constructor(private readonly refunds: RefundsService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateRefundDto) {
    return this.refunds.createRequest(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/:refundNumber/complete')
  complete(@Param('refundNumber') refundNumber: string) {
    return this.refunds.complete(refundNumber);
  }

  @Get('mine')
  mine(@Req() req: AuthenticatedRequest) {
    return this.refunds.mine(req.user.sub);
  }
}
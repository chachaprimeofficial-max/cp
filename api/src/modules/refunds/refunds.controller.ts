import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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

  @Get('mine')
  mine(@Req() req: AuthenticatedRequest) {
    return this.refunds.mine(req.user.sub);
  }
}
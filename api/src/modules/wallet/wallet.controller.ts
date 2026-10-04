import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WalletService } from './wallet.service';

type AuthenticatedRequest = Request & { user: { sub: string } };

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get()
  getWallet(@Req() req: AuthenticatedRequest) {
    return this.wallet.getWallet(req.user.sub);
  }
}
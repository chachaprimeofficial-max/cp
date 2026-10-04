import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Refund, RefundSchema } from './refund.schema';
import { Order, OrderSchema } from '../orders/order.schema';
import { RefundsController } from './refunds.controller';
import { RefundsService } from './refunds.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WalletModule, MongooseModule.forFeature([
    { name: Refund.name, schema: RefundSchema },
    { name: Order.name, schema: OrderSchema },
  ])],
  controllers: [RefundsController],
  providers: [RefundsService],
  exports: [RefundsService],
})
export class RefundsModule {}
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupBuy, GroupBuySchema } from './group-buy.schema';
import { Product, ProductSchema } from '../products/product.schema';
import { WalletModule } from '../wallet/wallet.module';
import { GroupBuyService } from './group-buy.service';
import { GroupBuyController } from './group-buy.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: GroupBuy.name, schema: GroupBuySchema }, { name: Product.name, schema: ProductSchema }]), WalletModule],
  controllers: [GroupBuyController],
  providers: [GroupBuyService],
  exports: [GroupBuyService],
})
export class GroupBuyModule {}

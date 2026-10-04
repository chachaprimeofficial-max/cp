import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../products/product.schema';
import { AuthModule } from '../auth/auth.module';
import { CouponsModule } from '../coupons/coupons.module';
import { Order, OrderSchema } from './order.schema';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
@Module({
 imports:[AuthModule,CouponsModule,MongooseModule.forFeature([{name:Order.name,schema:OrderSchema},{name:Product.name,schema:ProductSchema}])],
 controllers:[OrdersController], providers:[OrdersService],
})
export class OrdersModule {}

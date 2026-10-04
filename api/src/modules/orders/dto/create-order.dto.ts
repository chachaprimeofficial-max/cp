import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CreateOrderItemDto {
  @IsString() productId!: string;
  @IsInt() @Min(1) quantity!: number;
}
export class CreateOrderDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => CreateOrderItemDto) items!: CreateOrderItemDto[];
  @IsObject() shippingAddress!: Record<string, unknown>;
  @IsOptional() @IsString() couponCode?: string;
  @IsOptional() @IsString() @IsIn(['card','paypal','wallet']) paymentMethod?: string;
}

import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CartItemDto {
  @IsString()
  productId!: string;

  @IsString()
  name!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsInt()
  @Min(0)
  unitPrice!: number;

  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdateCartDto {
  @IsArray()
  items!: CartItemDto[];
}

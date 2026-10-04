import { IsArray, IsString } from 'class-validator';

export class UpdateWishlistDto {
  @IsArray()
  @IsString({ each: true })
  productIds!: string[];
}

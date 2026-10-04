import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  orderNumber: string;

  @IsIn(['card', 'paypal'])
  method: 'card' | 'paypal';

  @IsOptional()
  @IsString()
  currency?: string;
}
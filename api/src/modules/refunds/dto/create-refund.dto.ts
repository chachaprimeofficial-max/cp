import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateRefundDto {
  @IsString()
  orderNumber: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}
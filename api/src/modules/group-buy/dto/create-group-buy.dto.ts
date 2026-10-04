import { IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CreateGroupBuyDto {
  @IsString() productId: string;
  @IsNumber() @Min(0) targetAmount: number;
  @IsNumber() @Min(0) contributionAmount: number;
  @IsInt() @Min(1) targetMembers: number;
  @IsInt() @Min(1) expiresInHours: number;
}
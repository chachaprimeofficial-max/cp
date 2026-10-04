import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString() name: string;
  @IsString() slug: string;
  @IsOptional() @IsString() description?: string;
  @IsNumber() @Min(0) price: number;
  @IsOptional() @IsNumber() @Min(0) compareAtPrice?: number;
  @IsOptional() @IsNumber() @Min(0) stock?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}

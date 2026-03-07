import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PricingType } from '@prisma/client';

export class SetPricingDto {
  @IsEnum(PricingType)
  type: PricingType;

  @IsInt()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string; // default KES
}

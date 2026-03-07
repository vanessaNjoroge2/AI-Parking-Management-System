import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateParkingLotDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  addressText?: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacityTotal?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isGuarded?: boolean;

  @IsOptional()
  @IsBoolean()
  wheelchairFriendly?: boolean;

  @IsOptional()
  @IsBoolean()
  hasCctv?: boolean;

  @IsOptional()
  @IsBoolean()
  hasLighting?: boolean;
}

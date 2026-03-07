import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateParkingLotDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  addressText?: string;

  // send as number in request
  latitude: number;
  longitude: number;

  @IsInt()
  @Min(1)
  capacityTotal: number;

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

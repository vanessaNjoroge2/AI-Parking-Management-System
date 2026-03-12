import { IsNotEmpty, IsString } from 'class-validator';

export class StkPushDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}
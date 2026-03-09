import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class EstimateBookingDto {
  @IsString()
  @IsNotEmpty()
  parkingLotId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}

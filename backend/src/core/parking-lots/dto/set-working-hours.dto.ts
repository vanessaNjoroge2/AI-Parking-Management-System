import { IsBoolean, Matches, IsInt, IsString, Max, Min } from 'class-validator';

export class WorkingHourItemDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  opensAt: string; // "08:00"

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  closesAt: string; // "18:00"

  @IsBoolean()
  isClosed: boolean;
}

import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt/jwt-auth.guard';
import type { AuthRequest } from '../../../shared/interfaces/authrequest.interface';
import { AnalyticsService } from '../service/analytics.service';

@Controller()
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('owner/analytics/summary')
  ownerSummary(@Req() req: AuthRequest, @Query('date') date?: string) {
    return this.service.ownerSummary(req.user, date);
  }

  @UseGuards(JwtAuthGuard)
  @Get('owner/analytics/bookings-per-hour')
  bookingsPerHour(@Req() req: AuthRequest, @Query('date') date?: string) {
    return this.service.bookingsPerHour(req.user, date);
  }

  @UseGuards(JwtAuthGuard)
  @Get('owner/analytics/daily-revenue')
  dailyRevenue(
    @Req() req: AuthRequest,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.dailyRevenue(req.user, from, to);
  }

  @Get('parking-lots/:id/capacity')
  parkingLotCapacity(
    @Param('id') id: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.service.parkingLotCapacity(id, startTime, endTime);
  }
  @UseGuards(JwtAuthGuard)
  @Get('owner/analytics/cars-per-day')
  carsPerDay(
    @Req() req: AuthRequest,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.carsPerDay(req.user, from, to);
  }

  @UseGuards(JwtAuthGuard)
  @Get('owner/parking-lots/:id/stats')
  parkingLotStats(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Query('date') date?: string,
  ) {
    return this.service.parkingLotStats(req.user, id, date);
  }
}

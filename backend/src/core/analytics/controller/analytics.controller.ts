import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt/jwt-auth.guard';
import type { AuthRequest } from '../../../shared/interfaces/authrequest.interface';
import { AnalyticsService } from '../service/analytics.service';
import type { Response } from 'express';

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

  @UseGuards(JwtAuthGuard)
  @Get('owner/analytics/report-data')
  ownerReportData(
    @Req() req: AuthRequest,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('parkingLotId') parkingLotId?: string,
  ) {
    return this.service.ownerReportData(req.user, from, to, parkingLotId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('owner/analytics/report.csv')
  async downloadOwnerReportCsv(
    @Req() req: AuthRequest,
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('parkingLotId') parkingLotId?: string,
  ) {
    const { buffer, fileName } = await this.service.generateOwnerReportCsv(
      req.user,
      from,
      to,
      parkingLotId,
    );

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length.toString(),
    });

    res.end(buffer);
  }

  @UseGuards(JwtAuthGuard)
  @Get('owner/analytics/report')
  async downloadOwnerReport(
    @Req() req: AuthRequest,
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('parkingLotId') parkingLotId?: string,
  ) {
    const { buffer, fileName } = await this.service.generateOwnerReportPdf(
      req.user,
      from,
      to,
      parkingLotId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length.toString(),
    });

    res.end(buffer);
  }

  // @Get('analytics/owner/report')
  // // @UseGuards(JwtAuthGuard)
  // async downloadOwnerReport(
  //   @Req() req: any,
  //   @Query('from') from?: string,
  //   @Query('to') to?: string,
  //   @Query('parkingLotId') parkingLotId?: string,
  //   @Res() res?: Response,
  // ) {
  //   const { buffer, fileName } =
  //     await this.analyticsService.generateOwnerReportPdf(
  //       req.user,
  //       from,
  //       to,
  //       parkingLotId,
  //     );

  //   res?.set({
  //     'Content-Type': 'application/pdf',
  //     'Content-Disposition': `attachment; filename="${fileName}"`,
  //     'Content-Length': buffer.length,
  //   });

  //   res?.end(buffer);
  // }
}

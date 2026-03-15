import { Module } from '@nestjs/common';
import { AnalyticsController } from '../analytics/controller/analytics.controller';
import { AnalyticsService } from '../analytics/service/analytics.service';
import { AnalyticsRepository } from '../../shared/database/repository/analytics/analytics.repository';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsRepository],
})
export class AnalyticsModule {}

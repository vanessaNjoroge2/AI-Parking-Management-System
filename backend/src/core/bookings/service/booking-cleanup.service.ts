import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingsRepository } from '../../../shared/database/repository/bookings/bookings.repository';

@Injectable()
export class BookingCleanupService {
  constructor(private readonly repo: BookingsRepository) {}

  // Runs every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handlePendingExpiry() {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago

    const result = await this.repo.expireOldPendingBookings(cutoff);

    if (result.count > 0) {
      console.log(`Expired ${result.count} pending bookings`);
    }
  }
}

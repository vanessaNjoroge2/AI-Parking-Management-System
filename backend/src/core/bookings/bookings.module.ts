import { Module } from '@nestjs/common';
import { BookingsController } from './controller/bookings.controller';
import { BookingsService } from './service/bookings.service';
import { BookingCleanupService } from './service/booking-cleanup.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, BookingCleanupService],
})
export class BookingsModule {}

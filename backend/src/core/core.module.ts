import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ParkingLotsModule } from './parking-lots/parking-lots.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { BookingsModule } from './bookings/bookings.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    ParkingLotsModule,
    UsersModule,
    PaymentsModule,
    BookingsModule,
    AnalyticsModule,
  ],
  exports: [
    AuthModule,
    ParkingLotsModule,
    UsersModule,
    PaymentsModule,
    BookingsModule,
  ],
})
export class CoreModule {}

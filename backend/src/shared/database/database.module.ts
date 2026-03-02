import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './service/database.service';
import { ParkingLotsRepository } from './repository/parking-lots/parking-lots.repository';
import { BookingsRepository } from './repository/bookings/bookings.repository';
import { PaymentsRepository } from './repository/payments/payments.repository';

@Global()
@Module({
  providers: [
    DatabaseService,
    ParkingLotsRepository,
    BookingsRepository,
    PaymentsRepository,
  ],
  exports: [
    DatabaseService,
    ParkingLotsRepository,
    BookingsRepository,
    PaymentsRepository,
  ],
})
export class DatabaseModule {}

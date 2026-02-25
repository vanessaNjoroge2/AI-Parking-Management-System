import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './service/database.service';
import { ParkingLotsRepository } from './repository/parking-lots/parking-lots.repository';
import { BookingsRepository } from './repository/bookings.repository';

@Global()
@Module({
  providers: [DatabaseService, ParkingLotsRepository, BookingsRepository],
  exports: [DatabaseService, ParkingLotsRepository, BookingsRepository],
})
export class DatabaseModule {}

import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './service/database.service';
import { ParkingLotsRepository } from './repository/parking-lots/parking-lots.repository';

@Global()
@Module({
  providers: [DatabaseService, ParkingLotsRepository],
  exports: [DatabaseService, ParkingLotsRepository],
})
export class DatabaseModule {}

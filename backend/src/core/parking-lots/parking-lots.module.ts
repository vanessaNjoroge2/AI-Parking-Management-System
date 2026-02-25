import { Module } from '@nestjs/common';
import { ParkingLotsController } from './controller/parking-lots.controller';
import { ParkingLotsService } from './service/parking-lots.service';

@Module({
  controllers: [ParkingLotsController],
  providers: [ParkingLotsService],
})
export class ParkingLotsModule {}

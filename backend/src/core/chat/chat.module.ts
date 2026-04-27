import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { BookingsRepository } from '../../shared/database/repository/bookings/bookings.repository';
import { ParkingLotsRepository } from '../../shared/database/repository/parking-lots/parking-lots.repository';

@Module({
  controllers: [ChatController],
  providers: [ChatService, BookingsRepository, ParkingLotsRepository],
})
export class ChatModule {}

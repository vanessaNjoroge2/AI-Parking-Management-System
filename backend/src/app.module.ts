import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { DatabaseService } from './shared/database/service/database.service';
import { UsersModule } from './core/users/users.module';
import { ParkingLotsModule } from './core/parking-lots/parking-lots.module';
import { AuthModule } from './core/auth/auth.module';
import { BookingsModule } from './core/bookings/bookings.module';
import { PaymentsModule } from './core/payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    UsersModule,
    ParkingLotsModule,
    AuthModule,
    BookingsModule,
    PaymentsModule,
  ],
  providers: [DatabaseService],
})
export class AppModule {}

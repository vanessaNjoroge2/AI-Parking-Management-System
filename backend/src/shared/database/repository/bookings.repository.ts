import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../service/database.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsRepository {
  constructor(private readonly db: DatabaseService) {}

  findLot(parkingLotId: string) {
    return this.db.parkingLot.findUnique({
      where: { id: parkingLotId },
      select: { id: true, ownerId: true, isActive: true, capacityTotal: true },
    });
  }

  getWorkingHour(parkingLotId: string, dayOfWeek: number) {
    return this.db.workingHour.findUnique({
      where: { parkingLotId_dayOfWeek: { parkingLotId, dayOfWeek } },
    });
  }

  countOverlappingBookedCars(parkingLotId: string, start: Date, end: Date) {
    return this.db.booking.aggregate({
      where: {
        parkingLotId,
        status: {
          in: [
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
            BookingStatus.PENDING,
          ],
        },
        startTime: { lt: end },
        endTime: { gt: start },
      },
      _sum: { numberOfCars: true },
    });
  }

  createBooking(data: {
    userId: string;
    parkingLotId: string;
    startTime: Date;
    endTime: Date;
    vehiclePlate?: string | null;
    preference?: string | null;
    numberOfCars: number;
  }) {
    return this.db.booking.create({
      data: {
        ...data,
        status: BookingStatus.PENDING,
      },
    });
  }

  findMyBookings(userId: string) {
    return this.db.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        parkingLot: { select: { id: true, name: true, addressText: true } },
        payment: true,
      },
    });
  }

  expireOldPendingBookings(cutoff: Date) {
    return this.db.booking.updateMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: cutoff },
      },
      data: {
        status: 'EXPIRED',
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../service/database.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';

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

  findMyBookingById(userId: string, id: string) {
    return this.db.booking.findFirst({
      where: { id, userId },
      include: {
        parkingLot: {
          select: { id: true, name: true, addressText: true, ownerId: true },
        },
        payment: true,
      },
    });
  }

  expireOldPendingBookings(cutoff: Date) {
    return this.db.booking.updateMany({
      where: {
        status: BookingStatus.PENDING,
        createdAt: { lt: cutoff },
        OR: [
          { payment: null },
          {
            payment: {
              status: {
                not: PaymentStatus.SUCCESS,
              },
            },
          },
        ],
      },
      data: {
        status: BookingStatus.EXPIRED,
      },
    });
  }
  findBookingById(id: string) {
    return this.db.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
        parkingLot: { select: { id: true, name: true, ownerId: true } },
        payment: true,
      },
    });
  }

  findOwnerBookings(ownerId: string, start: Date, end: Date) {
    return this.db.booking.findMany({
      where: {
        parkingLot: { ownerId },
        startTime: { lt: end },
        endTime: { gt: start },
      },
      orderBy: { startTime: 'asc' },
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
        parkingLot: { select: { id: true, name: true, addressText: true } },
        payment: true,
      },
    });
  }
  updateBookingStatus(id: string, status: BookingStatus) {
    return this.db.booking.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
        parkingLot: { select: { id: true, name: true, addressText: true } },
        payment: true,
      },
    });
  }
  getLotWithActivePricing(parkingLotId: string) {
    return this.db.parkingLot.findUnique({
      where: { id: parkingLotId },
      include: {
        pricingRules: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }
}

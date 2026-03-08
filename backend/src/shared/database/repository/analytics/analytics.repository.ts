import { Injectable } from '@nestjs/common';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { DatabaseService } from '../../service/database.service';

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly db: DatabaseService) {}

  async getOwnerSummary(ownerId: string, start: Date, end: Date) {
    const [bookingsAgg, paymentsAgg, activeParkingLots] = await Promise.all([
      this.db.booking.aggregate({
        where: {
          parkingLot: { ownerId },
          startTime: { gte: start, lte: end },
          status: {
            in: [
              BookingStatus.CONFIRMED,
              BookingStatus.CHECKED_IN,
              BookingStatus.COMPLETED,
            ],
          },
        },
        _count: { id: true },
        _sum: { numberOfCars: true },
      }),
      this.db.payment.aggregate({
        where: {
          status: PaymentStatus.SUCCESS,
          booking: {
            parkingLot: { ownerId },
          },
          createdAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
      }),
      this.db.parkingLot.count({
        where: {
          ownerId,
          isActive: true,
        },
      }),
    ]);

    return {
      totalBookings: bookingsAgg._count.id,
      totalCars: bookingsAgg._sum.numberOfCars ?? 0,
      totalRevenue: paymentsAgg._sum.amount ?? 0,
      activeParkingLots,
      currency: 'KES',
    };
  }

  async getOwnerBookings(ownerId: string, start: Date, end: Date) {
    return this.db.booking.findMany({
      where: {
        parkingLot: { ownerId },
        startTime: { gte: start, lte: end },
        status: {
          in: [
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
            BookingStatus.COMPLETED,
          ],
        },
      },
      select: {
        startTime: true,
        numberOfCars: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getOwnerSuccessfulPayments(ownerId: string, start: Date, end: Date) {
    return this.db.payment.findMany({
      where: {
        status: PaymentStatus.SUCCESS,
        booking: {
          parkingLot: { ownerId },
        },
        createdAt: { gte: start, lte: end },
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getParkingLotCapacityUsage(
    parkingLotId: string,
    start: Date,
    end: Date,
  ) {
    const [lot, bookingsAgg] = await Promise.all([
      this.db.parkingLot.findUnique({
        where: { id: parkingLotId },
        select: {
          id: true,
          name: true,
          capacityTotal: true,
          ownerId: true,
          isActive: true,
        },
      }),
      this.db.booking.aggregate({
        where: {
          parkingLotId,
          startTime: { lt: end },
          endTime: { gt: start },
          status: {
            in: [
              BookingStatus.PENDING,
              BookingStatus.CONFIRMED,
              BookingStatus.CHECKED_IN,
            ],
          },
        },
        _sum: { numberOfCars: true },
      }),
    ]);

    return {
      lot,
      carsBooked: bookingsAgg._sum.numberOfCars ?? 0,
    };
  }
  async getOwnerBookingsInRange(ownerId: string, start: Date, end: Date) {
    return this.db.booking.findMany({
      where: {
        parkingLot: { ownerId },
        startTime: { gte: start, lte: end },
        status: {
          in: [
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
            BookingStatus.COMPLETED,
          ],
        },
      },
      select: {
        startTime: true,
        numberOfCars: true,
        parkingLotId: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getParkingLotStats(
    ownerId: string,
    parkingLotId: string,
    start: Date,
    end: Date,
  ) {
    const [lot, bookingsAgg, paymentsAgg] = await Promise.all([
      this.db.parkingLot.findFirst({
        where: {
          id: parkingLotId,
          ownerId,
        },
        select: {
          id: true,
          name: true,
          capacityTotal: true,
          isActive: true,
        },
      }),
      this.db.booking.aggregate({
        where: {
          parkingLotId,
          parkingLot: { ownerId },
          startTime: { gte: start, lte: end },
          status: {
            in: [
              BookingStatus.CONFIRMED,
              BookingStatus.CHECKED_IN,
              BookingStatus.COMPLETED,
            ],
          },
        },
        _count: { id: true },
        _sum: { numberOfCars: true },
      }),
      this.db.payment.aggregate({
        where: {
          status: PaymentStatus.SUCCESS,
          booking: {
            parkingLotId,
            parkingLot: { ownerId },
          },
          createdAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      lot,
      totalBookings: bookingsAgg._count.id,
      totalCars: bookingsAgg._sum.numberOfCars ?? 0,
      totalRevenue: paymentsAgg._sum.amount ?? 0,
    };
  }
}

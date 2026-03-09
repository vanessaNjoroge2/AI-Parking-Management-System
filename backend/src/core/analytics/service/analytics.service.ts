import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AnalyticsRepository } from '../../../shared/database/repository/analytics/analytics.repository';

@Injectable()
export class AnalyticsService {
  constructor(private readonly repo: AnalyticsRepository) {}

  async ownerSummary(user: { userId: string; role: string }, date?: string) {
    if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only owners can view analytics');
    }

    const baseDate = date ? new Date(date) : new Date();
    if (isNaN(baseDate.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    const start = new Date(baseDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(baseDate);
    end.setHours(23, 59, 59, 999);

    return this.repo.getOwnerSummary(user.userId, start, end);
  }

  async bookingsPerHour(user: { userId: string; role: string }, date?: string) {
    if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only owners can view analytics');
    }

    const baseDate = date ? new Date(date) : new Date();
    if (isNaN(baseDate.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    const start = new Date(baseDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(baseDate);
    end.setHours(23, 59, 59, 999);

    const bookings = await this.repo.getOwnerBookings(user.userId, start, end);

    const hourlyMap = new Map<
      number,
      { hour: string; bookings: number; cars: number }
    >();

    for (let h = 0; h < 24; h++) {
      hourlyMap.set(h, {
        hour: `${String(h).padStart(2, '0')}:00`,
        bookings: 0,
        cars: 0,
      });
    }

    for (const booking of bookings) {
      const hour = new Date(booking.startTime).getHours();
      const current = hourlyMap.get(hour);

      if (current) {
        current.bookings += 1;
        current.cars += booking.numberOfCars;
      }
    }

    const points = Array.from(hourlyMap.values());
    const peak = points.reduce((max, curr) =>
      curr.bookings > max.bookings ? curr : max,
    );

    return {
      date: start.toISOString().split('T')[0],
      points,
      peakHour: peak.hour,
    };
  }

  async dailyRevenue(
    user: { userId: string; role: string },
    from?: string,
    to?: string,
  ) {
    if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only owners can view analytics');
    }

    const start = from ? new Date(from) : new Date();
    const end = to ? new Date(to) : new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date range');
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const payments = await this.repo.getOwnerSuccessfulPayments(
      user.userId,
      start,
      end,
    );

    const dayMap = new Map<string, number>();

    for (const payment of payments) {
      const day = payment.createdAt.toISOString().split('T')[0];
      dayMap.set(day, (dayMap.get(day) ?? 0) + payment.amount);
    }

    const points = Array.from(dayMap.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    return {
      from: start.toISOString().split('T')[0],
      to: end.toISOString().split('T')[0],
      currency: 'KES',
      points,
    };
  }

  async parkingLotCapacity(
    parkingLotId: string,
    startTime: string,
    endTime: string,
  ) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime())) {
      throw new BadRequestException('Invalid startTime');
    }

    if (isNaN(end.getTime())) {
      throw new BadRequestException('Invalid endTime');
    }

    if (end <= start) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const result = await this.repo.getParkingLotCapacityUsage(
      parkingLotId,
      start,
      end,
    );

    if (!result.lot) {
      throw new NotFoundException('Parking lot not found');
    }

    const capacityLeft = Math.max(
      result.lot.capacityTotal - result.carsBooked,
      0,
    );

    return {
      parkingLotId: result.lot.id,
      parkingLotName: result.lot.name,
      capacityTotal: result.lot.capacityTotal,
      carsBooked: result.carsBooked,
      capacityLeft,
      startTime: start,
      endTime: end,
    };
  }

  async carsPerDay(
    user: { userId: string; role: string },
    from?: string,
    to?: string,
  ) {
    if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only owners can view analytics');
    }

    const start = from ? new Date(from) : new Date();
    const end = to ? new Date(to) : new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date range');
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const bookings = await this.repo.getOwnerBookingsInRange(
      user.userId,
      start,
      end,
    );

    const dayMap = new Map<string, number>();

    for (const booking of bookings) {
      const day = booking.startTime.toISOString().split('T')[0];
      dayMap.set(day, (dayMap.get(day) ?? 0) + booking.numberOfCars);
    }

    const points = Array.from(dayMap.entries()).map(([date, cars]) => ({
      date,
      cars,
    }));

    return {
      from: start.toISOString().split('T')[0],
      to: end.toISOString().split('T')[0],
      points,
    };
  }

  async parkingLotStats(
    user: { userId: string; role: string },
    parkingLotId: string,
    date?: string,
  ) {
    if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only owners can view analytics');
    }

    const baseDate = date ? new Date(date) : new Date();
    if (isNaN(baseDate.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    const start = new Date(baseDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(baseDate);
    end.setHours(23, 59, 59, 999);

    const result = await this.repo.getParkingLotStats(
      user.userId,
      parkingLotId,
      start,
      end,
    );

    if (!result.lot) {
      throw new NotFoundException('Parking lot not found');
    }

    return {
      parkingLotId: result.lot.id,
      parkingLotName: result.lot.name,
      capacityTotal: result.lot.capacityTotal,
      isActive: result.lot.isActive,
      date: start.toISOString().split('T')[0],
      totalBookings: result.totalBookings,
      totalCars: result.totalCars,
      totalRevenue: result.totalRevenue,
      currency: 'KES',
    };
  }
}

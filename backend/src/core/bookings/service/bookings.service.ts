import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { BookingsRepository } from '../../../shared/database/repository/bookings/bookings.repository';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BookingStatus, UserRole } from '@prisma/client';
import { EstimateBookingDto } from '../dto/estimate-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly repo: BookingsRepository) {}

  async create(user: { userId: string }, dto: CreateBookingDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (!(start instanceof Date) || isNaN(start.getTime())) {
      throw new BadRequestException('Invalid startTime');
    }

    if (!(end instanceof Date) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid endTime');
    }

    if (end <= start) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const lot = await this.repo.findLot(dto.parkingLotId);
    if (!lot) throw new NotFoundException('Parking lot not found');

    if (!lot.isActive) {
      throw new BadRequestException('Parking lot is not active');
    }

    const dayOfWeek = start.getDay();
    const hours = await this.repo.getWorkingHour(dto.parkingLotId, dayOfWeek);

    if (!hours || hours.isClosed) {
      throw new BadRequestException('Parking lot is closed on this day');
    }

    const [openH, openM] = hours.opensAt.split(':').map(Number);
    const [closeH, closeM] = hours.closesAt.split(':').map(Number);

    const open = new Date(start);
    open.setHours(openH, openM, 0, 0);

    const close = new Date(start);
    close.setHours(closeH, closeM, 0, 0);

    if (start < open || end > close) {
      throw new BadRequestException('Booking time is outside working hours');
    }

    const numberOfCars = dto.numberOfCars ?? 1;

    const agg = await this.repo.countOverlappingBookedCars(
      dto.parkingLotId,
      start,
      end,
    );
    const alreadyBooked = agg._sum.numberOfCars ?? 0;

    const available = lot.capacityTotal - alreadyBooked;
    if (available < numberOfCars) {
      throw new BadRequestException(
        `Not enough space. Available: ${Math.max(available, 0)}`,
      );
    }

    // get active pricing
    const lotWithPricing = await this.repo.getLotWithActivePricing(
      dto.parkingLotId,
    );

    if (!lotWithPricing) {
      throw new NotFoundException('Parking lot not found');
    }

    const pricingRule = lotWithPricing.pricingRules[0];

    if (!pricingRule) {
      throw new BadRequestException(
        'No active pricing rule found for this parking lot',
      );
    }

    const diffMs = end.getTime() - start.getTime();

    let units = 1;
    let totalAmount = pricingRule.amount;

    if (pricingRule.type === 'HOURLY') {
      units = Math.ceil(diffMs / (1000 * 60 * 60));
      totalAmount = units * pricingRule.amount;
    } else if (pricingRule.type === 'DAILY') {
      units = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      totalAmount = units * pricingRule.amount;
    } else if (pricingRule.type === 'FLAT') {
      units = 1;
      totalAmount = pricingRule.amount;
    }

    const booking = await this.repo.createBooking({
      userId: user.userId,
      parkingLotId: dto.parkingLotId,
      startTime: start,
      endTime: end,
      vehiclePlate: dto.vehiclePlate ?? null,
      preference: dto.preference ?? null,
      numberOfCars,
    });

    return {
      booking,
      pricing: {
        parkingLotId: lotWithPricing.id,
        parkingLotName: lotWithPricing.name,
        pricingType: pricingRule.type,
        unitAmount: pricingRule.amount,
        currency: pricingRule.currency,
        units,
        totalAmount,
        startTime: start,
        endTime: end,
      },
    };
  }
  myBookings(user: { userId: string }) {
    return this.repo.findMyBookings(user.userId);
  }

  async myBookingById(user: { userId: string }, bookingId: string) {
    const booking = await this.repo.findMyBookingById(user.userId, bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async cancelMyBooking(user: { userId: string }, bookingId: string) {
    const booking = await this.repo.findMyBookingById(user.userId, bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.REFUNDED ||
      booking.status === BookingStatus.EXPIRED
    ) {
      throw new BadRequestException(
        `Booking cannot be cancelled when status is ${booking.status}`,
      );
    }

    return this.repo.updateBookingStatus(bookingId, BookingStatus.CANCELLED);
  }

  async ownerBookings(user: { userId: string; role: string }, date?: string) {
    if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only owners can view owner bookings');
    }

    // Default: today
    const d = date ? new Date(date) : new Date();
    if (isNaN(d.getTime())) throw new BadRequestException('Invalid date');

    const start = new Date(d);
    start.setHours(0, 0, 0, 0);

    const end = new Date(d);
    end.setHours(23, 59, 59, 999);

    return this.repo.findOwnerBookings(user.userId, start, end);
  }

  async checkIn(user: { userId: string; role: string }, bookingId: string) {
    const booking = await this.repo.findBookingById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    // owner authorization
    if (
      user.role !== UserRole.ADMIN &&
      booking.parkingLot.ownerId !== user.userId
    ) {
      throw new ForbiddenException('Not your parking lot booking');
    }

    // status rules
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        'Only CONFIRMED bookings can be checked-in',
      );
    }

    return this.repo.updateBookingStatus(bookingId, BookingStatus.CHECKED_IN);
  }

  async checkOut(user: { userId: string; role: string }, bookingId: string) {
    const booking = await this.repo.findBookingById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    if (
      user.role !== UserRole.ADMIN &&
      booking.parkingLot.ownerId !== user.userId
    ) {
      throw new ForbiddenException('Not your parking lot booking');
    }

    if (booking.status !== BookingStatus.CHECKED_IN) {
      throw new BadRequestException(
        'Only CHECKED_IN bookings can be checked-out',
      );
    }

    return this.repo.updateBookingStatus(bookingId, BookingStatus.COMPLETED);
  }
  async estimate(dto: EstimateBookingDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (isNaN(start.getTime())) {
      throw new BadRequestException('Invalid startTime');
    }

    if (isNaN(end.getTime())) {
      throw new BadRequestException('Invalid endTime');
    }

    if (end <= start) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const lot = await this.repo.getLotWithActivePricing(dto.parkingLotId);

    if (!lot) {
      throw new NotFoundException('Parking lot not found');
    }

    const pricingRule = lot.pricingRules[0];

    if (!pricingRule) {
      throw new BadRequestException(
        'No active pricing rule found for this parking lot',
      );
    }

    const diffMs = end.getTime() - start.getTime();

    let units = 1;
    let totalAmount = pricingRule.amount;

    if (pricingRule.type === 'HOURLY') {
      units = Math.ceil(diffMs / (1000 * 60 * 60));
      totalAmount = units * pricingRule.amount;
    } else if (pricingRule.type === 'DAILY') {
      units = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      totalAmount = units * pricingRule.amount;
    } else if (pricingRule.type === 'FLAT') {
      units = 1;
      totalAmount = pricingRule.amount;
    }

    return {
      parkingLotId: lot.id,
      parkingLotName: lot.name,
      pricingType: pricingRule.type,
      unitAmount: pricingRule.amount,
      currency: pricingRule.currency,
      units,
      totalAmount,
      startTime: start,
      endTime: end,
    };
  }
}

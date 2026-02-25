import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingsRepository } from '../../../shared/database/repository/bookings.repository';
import { CreateBookingDto } from '../dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly repo: BookingsRepository) {}

  async create(user: { userId: string }, dto: CreateBookingDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (!(start instanceof Date) || isNaN(start.getTime()))
      throw new BadRequestException('Invalid startTime');
    if (!(end instanceof Date) || isNaN(end.getTime()))
      throw new BadRequestException('Invalid endTime');
    if (end <= start)
      throw new BadRequestException('endTime must be after startTime');

    const lot = await this.repo.findLot(dto.parkingLotId);
    if (!lot) throw new NotFoundException('Parking lot not found');
    if (!lot.isActive)
      throw new BadRequestException('Parking lot is not active');

    // Check working hours
    const dayOfWeek = start.getDay();
    const hours = await this.repo.getWorkingHour(dto.parkingLotId, dayOfWeek);
    if (!hours || hours.isClosed)
      throw new BadRequestException('Parking lot is closed on this day');

    // Simple hours check (MVP): booking must be within open-close window
    const [openH, openM] = hours.opensAt.split(':').map(Number);
    const [closeH, closeM] = hours.closesAt.split(':').map(Number);

    const open = new Date(start);
    open.setHours(openH, openM, 0, 0);
    const close = new Date(start);
    close.setHours(closeH, closeM, 0, 0);

    if (start < open || end > close)
      throw new BadRequestException('Booking time is outside working hours');

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

    return this.repo.createBooking({
      userId: user.userId,
      parkingLotId: dto.parkingLotId,
      startTime: start,
      endTime: end,
      vehiclePlate: dto.vehiclePlate ?? null,
      preference: dto.preference ?? null,
      numberOfCars,
    });
  }

  myBookings(user: { userId: string }) {
    return this.repo.findMyBookings(user.userId);
  }
}

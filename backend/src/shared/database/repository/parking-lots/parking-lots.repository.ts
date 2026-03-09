import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../service/database.service';
import { BookingStatus, PricingType } from '@prisma/client';
import { CreateParkingLotDto } from '../../../../core/parking-lots/dto/create-parking-lot.dto';
import { UpdateParkingLotDto } from '../../../../core/parking-lots/dto/update-parking-lot.dto';

@Injectable()
export class ParkingLotsRepository {
  constructor(private readonly db: DatabaseService) {}

  private async withOccupancy<T extends { id: string; capacityTotal: number }>(
    lots: T[],
  ) {
    if (lots.length === 0) return [];

    const now = new Date();
    const lotIds = lots.map((lot) => lot.id);
    const aggregates = await this.db.booking.groupBy({
      by: ['parkingLotId'],
      where: {
        parkingLotId: { in: lotIds },
        status: {
          in: [
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
          ],
        },
        startTime: { lte: now },
        endTime: { gt: now },
      },
      _sum: { numberOfCars: true },
    });

    const occupancyMap = new Map(
      aggregates.map((item) => [item.parkingLotId, item._sum.numberOfCars ?? 0]),
    );

    return lots.map((lot) => {
      const occupiedSpots = occupancyMap.get(lot.id) ?? 0;
      const availableSpots = Math.max(lot.capacityTotal - occupiedSpots, 0);
      return {
        ...lot,
        occupiedSpots,
        availableSpots,
      };
    });
  }

  createParkingLot(ownerId: string, data: CreateParkingLotDto) {
    return this.db.parkingLot.create({
      data: { ...data, ownerId },
    });
  }

  updateParkingLot(id: string, ownerId: string, data: UpdateParkingLotDto) {
    return this.db.parkingLot.update({
      where: { id },
      data,
    });
  }

  findOwnerLots(ownerId: string) {
    return this.db.parkingLot.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: {
        pricingRules: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        workingHours: true,
        photos: true,
      },
    });
  }

  async findById(id: string) {
    const lot = await this.db.parkingLot.findUnique({
      where: { id },
      include: {
        pricingRules: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        workingHours: true,
        photos: true,
        reviews: true,
      },
    });

    if (!lot) return null;
    const [lotWithOccupancy] = await this.withOccupancy([lot]);
    return lotWithOccupancy;
  }

  upsertWorkingHours(
    parkingLotId: string,
    items: {
      dayOfWeek: number;
      opensAt: string;
      closesAt: string;
      isClosed?: boolean;
    }[],
  ) {
    return this.db.$transaction(
      items.map((h) =>
        this.db.workingHour.upsert({
          where: {
            parkingLotId_dayOfWeek: { parkingLotId, dayOfWeek: h.dayOfWeek },
          },
          update: {
            opensAt: h.opensAt,
            closesAt: h.closesAt,
            isClosed: h.isClosed ?? false,
          },
          create: {
            parkingLotId,
            dayOfWeek: h.dayOfWeek,
            opensAt: h.opensAt,
            closesAt: h.closesAt,
            isClosed: h.isClosed ?? false,
          },
        }),
      ),
    );
  }

  createPricingRule(
    parkingLotId: string,
    type: PricingType,
    amount: number,
    currency = 'KES',
  ) {
    return this.db.pricingRule.create({
      data: { parkingLotId, type, amount, currency, isActive: true },
    });
  }

  // simple nearby search (we’ll improve later). Uses bounding box filter.
  async searchNearby(lat: number, lng: number, radiusKm: number) {
    const latDelta = radiusKm / 110.574;
    const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));

    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;

    const lots = await this.db.parkingLot.findMany({
      where: {
        isActive: true,
        latitude: { gte: minLat, lte: maxLat },
        longitude: { gte: minLng, lte: maxLng },
      },
      include: {
        pricingRules: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        photos: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.withOccupancy(lots);
  }
}

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../service/database.service';
import { PricingType } from '@prisma/client';
import { CreateParkingLotDto } from '../../../../core/parking-lots/dto/create-parking-lot.dto';
import { UpdateParkingLotDto } from '../../../../core/parking-lots/dto/update-parking-lot.dto';

@Injectable()
export class ParkingLotsRepository {
  constructor(private readonly db: DatabaseService) {}

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
        pricingRules: { where: { isActive: true } },
        workingHours: true,
        photos: true,
      },
    });
  }

  findById(id: string) {
    return this.db.parkingLot.findUnique({
      where: { id },
      include: {
        pricingRules: { where: { isActive: true } },
        workingHours: true,
        photos: true,
        reviews: true,
      },
    });
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
  searchNearby(lat: number, lng: number, radiusKm: number) {
    const latDelta = radiusKm / 110.574;
    const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));

    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;

    return this.db.parkingLot.findMany({
      where: {
        isActive: true,
        latitude: { gte: minLat, lte: maxLat },
        longitude: { gte: minLng, lte: maxLng },
      },
      include: {
        pricingRules: { where: { isActive: true } },
        photos: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

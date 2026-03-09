import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ParkingLotsRepository } from '../../../shared/database/repository/parking-lots/parking-lots.repository';
import { CreateParkingLotDto } from '../dto/create-parking-lot.dto';
import { UpdateParkingLotDto } from '../dto/update-parking-lot.dto';
import { WorkingHourItemDto } from '../dto/set-working-hours.dto';
import { SetPricingDto } from '../dto/set-pricing.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ParkingLotsService {
  constructor(private readonly repo: ParkingLotsRepository) {}

  async create(
    owner: { userId: string; role: string },
    dto: CreateParkingLotDto,
  ) {
    if (owner.role !== UserRole.OWNER && owner.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only owners can create parking lots');
    }
    return this.repo.createParkingLot(owner.userId, dto);
  }

  async update(
    owner: { userId: string; role: string },
    id: string,
    dto: UpdateParkingLotDto,
  ) {
    const lot = await this.repo.findById(id);
    if (!lot) throw new NotFoundException('Parking lot not found');

    if (owner.role !== UserRole.ADMIN && lot.ownerId !== owner.userId) {
      throw new ForbiddenException('Not your parking lot');
    }
    return this.repo.updateParkingLot(id, lot.ownerId, dto);
  }

  myLots(ownerId: string) {
    return this.repo.findOwnerLots(ownerId);
  }

  async setWorkingHours(
    owner: { userId: string; role: string },
    parkingLotId: string,
    dto: WorkingHourItemDto[],
  ) {
    if (!Array.isArray(dto) || dto.length === 0) {
      throw new BadRequestException('Working hours must be a non-empty array');
    }
    for (const item of dto) {
      if (!item.isClosed) {
        if (!item.opensAt || !item.closesAt) {
          throw new BadRequestException(
            'Open days must have opening and closing times',
          );
        }

        if (item.opensAt >= item.closesAt) {
          throw new BadRequestException(
            'Opening time must be before closing time',
          );
        }
      }
    }
    const lot = await this.repo.findById(parkingLotId);
    if (!lot) throw new NotFoundException('Parking lot not found');

    if (owner.role !== UserRole.ADMIN && lot.ownerId !== owner.userId) {
      throw new ForbiddenException('Not your parking lot');
    }
    return this.repo.upsertWorkingHours(parkingLotId, dto);
  }

  async setPricing(
    owner: { userId: string; role: string },
    parkingLotId: string,
    dto: SetPricingDto,
  ) {
    const lot = await this.repo.findById(parkingLotId);
    if (!lot) throw new NotFoundException('Parking lot not found');

    if (owner.role !== UserRole.ADMIN && lot.ownerId !== owner.userId) {
      throw new ForbiddenException('Not your parking lot');
    }
    return this.repo.setPricingRule(
      parkingLotId,
      dto.type,
      dto.amount,
      dto.currency ?? 'KES',
    );
  }

  search(lat: number, lng: number, radiusKm: number) {
    return this.repo.searchNearby(lat, lng, radiusKm);
  }

  async details(id: string) {
    const lot = await this.repo.findById(id);
    if (!lot) throw new NotFoundException('Parking lot not found');
    return lot;
  }

  async getPricing(id: string) {
    const lot = await this.repo.findById(id);
    if (!lot) throw new NotFoundException('Parking lot not found');

    const pricing = await this.repo.getActivePricingRule(id);
    if (!pricing) {
      throw new NotFoundException(
        'No active pricing found for this parking lot',
      );
    }

    return pricing;
  }
}

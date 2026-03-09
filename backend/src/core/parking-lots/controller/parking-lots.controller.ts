import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  ParseArrayPipe,
} from '@nestjs/common';
import { ParkingLotsService } from '../service/parking-lots.service';
import { CreateParkingLotDto } from '../dto/create-parking-lot.dto';
import { UpdateParkingLotDto } from '../dto/update-parking-lot.dto';
import { WorkingHourItemDto } from '../dto/set-working-hours.dto';
import { SetPricingDto } from '../dto/set-pricing.dto';
import type { AuthRequest } from '../../../shared/interfaces/authrequest.interface';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt/jwt-auth.guard';

@Controller('parking-lots')
export class ParkingLotsController {
  constructor(private readonly service: ParkingLotsService) {}

  // PUBLIC
  @Get('search')
  search(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radiusKm') radiusKm: string,
  ) {
    return this.service.search(Number(lat), Number(lng), Number(radiusKm ?? 3));
  }

  // OWNER PROTECTED
  @Get('owner/mine')
  @UseGuards(JwtAuthGuard)
  mine(@Req() req: AuthRequest) {
    return this.service.myLots(req.user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: AuthRequest, @Body() dto: CreateParkingLotDto) {
    return this.service.create(req.user, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateParkingLotDto,
  ) {
    return this.service.update(req.user, id, dto);
  }

  @Post(':id/working-hours')
  @UseGuards(JwtAuthGuard)
  setWorkingHours(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body(
      new ParseArrayPipe({
        items: WorkingHourItemDto,
        whitelist: true,
      }),
    )
    dto: WorkingHourItemDto[],
  ) {
    return this.service.setWorkingHours(req.user, id, dto);
  }

  @Post(':id/pricing')
  @UseGuards(JwtAuthGuard)
  setPricing(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: SetPricingDto,
  ) {
    return this.service.setPricing(req.user, id, dto);
  }

  // PUBLIC
  @Get(':id')
  details(@Param('id') id: string) {
    return this.service.details(id);
  }

  @Get(':id/pricing')
  getPricing(@Param('id') id: string) {
    return this.service.getPricing(id);
  }
}

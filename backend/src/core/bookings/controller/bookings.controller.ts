import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt/jwt-auth.guard';
import type { AuthRequest } from '../../../shared/interfaces/authrequest.interface';
import { BookingsService } from '../service/bookings.service';
import { CreateBookingDto } from '../dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly service: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateBookingDto) {
    return this.service.create(req.user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  my(@Req() req: AuthRequest) {
    return this.service.myBookings(req.user);
  }
  // ✅ OWNER: Today’s bookings (optional: ?date=2026-02-25)
  @UseGuards(JwtAuthGuard)
  @Get('owner')
  ownerBookings(@Req() req: AuthRequest, @Query('date') date?: string) {
    return this.service.ownerBookings(req.user, date);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/check-in')
  checkIn(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.service.checkIn(req.user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/check-out')
  checkOut(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.service.checkOut(req.user, id);
  }
}

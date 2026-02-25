import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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
}

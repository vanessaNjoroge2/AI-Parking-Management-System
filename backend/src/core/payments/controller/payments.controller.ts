import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt/jwt-auth.guard';
import type { AuthRequest } from '../../../shared/interfaces/authrequest.interface';
import { PaymentsService } from '../../../core/payments/service/payments.service';
import type { StkPushResponse } from '../service/payments.service'; 

@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('stk-push')
  stkPush(
    @Req() req: AuthRequest,
    @Body() dto: { bookingId: string; phone: string },
  ): Promise<StkPushResponse> {
    return this.service.stkPush(req.user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/handleKcbCallback')
  handleKcbCallback(@Body() payload: any) {
    return this.service.handleKcbCallback(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/simulate-fail')
  simulateFail(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.service.simulateFail(req.user, id);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOne(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.service.getOne(req.user, id);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  list(@Req() req: AuthRequest, @Query() q: any) {
    return this.service.list(req.user, q);
  }
}

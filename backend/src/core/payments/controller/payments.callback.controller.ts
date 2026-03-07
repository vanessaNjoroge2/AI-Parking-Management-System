import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { PaymentsService } from '../service/payments.service';

@Controller('payments/callback')
export class PaymentsCallbackController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('kcb')
  @HttpCode(200)
  async kcbCallback(@Body() payload: any) {
    await this.paymentsService.handleKcbCallback(payload);
    return { message: 'Callback received' };
  }
}

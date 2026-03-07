import { Module } from '@nestjs/common';
import { PaymentsController } from './controller/payments.controller';
import { PaymentsService } from './service/payments.service';
import { KcbBuniService } from './providers/kcb-buni.service';
import { PaymentsCallbackController } from './controller/payments.callback.controller';

@Module({
  controllers: [PaymentsController, PaymentsCallbackController],
  providers: [PaymentsService, KcbBuniService],
})
export class PaymentsModule {}

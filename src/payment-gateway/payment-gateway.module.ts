import { Module } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { PaymentGatewayController } from './payment-gateway.controller';

@Module({
  providers: [PaymentGatewayService],
  controllers: [PaymentGatewayController]
})
export class PaymentGatewayModule {}

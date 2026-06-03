import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Public()
  @Get('mock/:transactionId')
  getMockCheckout(@Param('transactionId', ParseIntPipe) transactionId: number) {
    return this.paymentService.getMockCheckout(transactionId);
  }

  @Public()
  @Post('mock/:transactionId/pay')
  simulatePay(@Param('transactionId', ParseIntPipe) transactionId: number) {
    return this.paymentService.simulatePayment(transactionId);
  }

  @Public()
  @Post('webhook')
  webhook(
    @Body()
    body: any,
  ) {
    return this.paymentService.handleWebhook(body);
  }
}

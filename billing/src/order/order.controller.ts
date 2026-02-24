import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('billing/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Post()
  async createOrder(
    @Body()
    body: {
      orderId: string;
      billingAccountId: string;
    },
  ) {
    return this.orderService.createOrder({
      orderId: body.orderId,
      billingAccountId: body.billingAccountId,
    });
  }

  @Get('seed')
  seedAccountInformation() {
    console.log('/sales product/seed HIT');
    return this.orderService.seedAccountInformation();
  }
}

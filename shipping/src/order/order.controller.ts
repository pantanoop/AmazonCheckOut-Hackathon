import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('shipping/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Post('')
  async createOrder(
    @Body()
    body: {
      orderId: string;
      shippingAddress: string;
    },
  ) {
    return this.orderService.createOrder({
      orderId: body.orderId,
      shippingAddress: body.shippingAddress,
    });
  }

  // @Get('seed')
  // seedProductInformation() {
  //   console.log('/sales product/seed HIT');
  //   return this.orderService.seedProductInformation();
  // }
}

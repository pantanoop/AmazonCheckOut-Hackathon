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

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Post()
  async createOrder(
    @Body()
    body: {
      orderId: string;
      customerId: string;
      products: {
        productId: string;
        quantity: number;
      }[];
    },
  ) {
    return this.orderService.createOrder({
      orderId: body.orderId,
      customerId: body.customerId,
      products: body.products.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
      })),
    });
  }

  @Patch(':id/place')
  async placeOrder(@Param('id') orderId: string) {
    return this.orderService.placeOrder(orderId);
  }

  @Get('seed')
  seedProductInformation() {
    console.log('/sales product/seed HIT');
    return this.orderService.seedProductInformation();
  }

  @Get()
  async getOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string[],
  ) {
    return this.orderService.getOrders({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
    });
  }
}

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

@Controller('/api/v1/sales/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Post()
  async placeOrder(
    @Body()
    body: {
      orderId: string;
      customerId: string;
      products: {
        productId: string;
        quantity: number;
      }[];
      orderTotal: number;
      billingAccountId: string;
    },
  ) {
    return this.orderService.placeOrder({
      orderId: body.orderId,
      customerId: body.customerId,
      products: body.products.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
      })),
      orderTotal: body.orderTotal,
      billingAccountId: body.billingAccountId,
    });
  }

  // @Patch(':id/place')
  // async placeOrder(@Param('id') orderId: string) {
  //   return this.orderService.placeOrder(orderId);
  // }

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

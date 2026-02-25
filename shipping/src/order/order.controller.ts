import { Body, Controller, Post, Get } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('api/v1/shipping/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Post()
  async createOrder(
    @Body()
    body: {
      orderId: string;
      products: {
        productId: string;
        quantity: number;
      }[];
      shippingAddress: string;
    },
  ) {
    return this.orderService.createOrder({
      orderId: body.orderId,
      products: body.products.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
      })),
      shippingAddress: body.shippingAddress,
    });
  }

  @Get('seed')
  seedProductInformation() {
    console.log('/shipping product/seed HIT');
    return this.orderService.seedProductInformation();
  }
}

/* eslint-disable */
import { Body, Controller, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('api/v1/orders')
export class OrdersController {
  constructor(private readonly http: HttpService) {}

  @Post()
  async createOrder(@Body() body: any) {
    await Promise.all([
      firstValueFrom(
        this.http.post('http://sales-service:6000/api/v1/sales/orders', {
          orderId: body.orderId,
          customerId: body.customerId,
          products: body.products,
        }),
      ),

      firstValueFrom(
        this.http.post('http://billing-service:5000/api/v1/billing/orders', {
          orderId: body.orderId,
          billingAccountId: body.billingAccountId,
          billingAddress: body.billingAddress,
        }),
      ),

      firstValueFrom(
        this.http.post('http://shipping-service:4000/api/v1/shipping/orders', {
          orderId: body.orderId,
          products: body.products,
          shippingAddress: body.shippingAddress,
        }),
      ),
    ]);

    return {
      orderId: body.orderId,
      message: 'order fan-out done',
    };
  }
}

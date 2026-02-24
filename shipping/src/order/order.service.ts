import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '../order/entities/order.entity';
import { OutboxMessage } from '../outbox/entities/outbox-table.entity';

@Injectable()
export class OrderService {
  constructor(private readonly dataSource: DataSource) {}

  async createOrder(input: {
    orderId: string;
    shippingAddress: string;
  }): Promise<Order> {
    const orderRepo = this.dataSource.getRepository(Order);

    const existing = await orderRepo.findOne({
      where: { orderId: input.orderId },
    });

    if (existing) {
      throw new BadRequestException('Order already exists');
    }

    const order = orderRepo.create({
      orderId: input.orderId,
      shippingAddress: input.shippingAddress,
      shippingLabelGenerated: false,
    });

    return orderRepo.save(order);
  }

  // async seedProductInformation() {
  //   const productRepo = this.dataSource.getRepository(Product);

  //   const products = [
  //     {
  //       productId: 'b17f77ae-5d5d-4183-a1f5-979c45a5f57f',
  //       price: 89.99,
  //     },
  //     {
  //       productId: '2b8a7b36-fb21-4ad8-a124-25d607c3e55c',
  //       price: 59.99,
  //     },
  //     {
  //       productId: '7c91f4b0-8d42-47f1-98c4-b3f975be3a41',
  //       price: 149.99,
  //     },
  //     {
  //       productId: 'e7a23cbb-4c59-4233-8d38-f2b82c3f949e',
  //       price: 19.99,
  //     },
  //     {
  //       productId: '9f3e1a65-5af7-4d1a-a08b-6d7c78d8a19e',
  //       price: 299.99,
  //     },
  //   ];

  //   for (const product of products) {
  //     const exists = await productRepo.findOne({
  //       where: { productId: product.productId },
  //     });

  //     if (!exists) {
  //       await productRepo.save(product);
  //     }
  //   }

  //   return { message: 'Sales Products seeded successfully' };
  // }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { Product } from '../order/entities/product.entity';

@Injectable()
export class OrderService {
  constructor(private readonly dataSource: DataSource) {}

  async createOrder(input: {
    orderId: string;
    products: { productId: string; quantity: number }[];
    shippingAddress: string;
  }): Promise<Order> {
    return await this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const productRepo = manager.getRepository(Product);

      const existing = await orderRepo.findOne({
        where: { orderId: input.orderId },
      });

      if (existing) {
        throw new BadRequestException('Order already exists');
      }

      for (const item of input.products) {
        const product = await productRepo.findOne({
          where: { productId: item.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new BadRequestException(
            `Product ${item.productId} does not exist`,
          );
        }

        if (product.quantity_on_hand < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${item.productId}`,
          );
        }

        product.quantity_on_hand -= item.quantity;
        await productRepo.save(product);
      }

      const order = orderRepo.create({
        orderId: input.orderId,
        shippingAddress: input.shippingAddress,
      });

      return await orderRepo.save(order);
    });
  }

  async seedProductInformation() {
    const productRepo = this.dataSource.getRepository(Product);

    const products = [
      {
        productId: 'b17f77ae-5d5d-4183-a1f5-979c45a5f57f',
        quantity_on_hand: 15,
      },
      {
        productId: '2b8a7b36-fb21-4ad8-a124-25d607c3e55c',
        quantity_on_hand: 25,
      },
      {
        productId: '7c91f4b0-8d42-47f1-98c4-b3f975be3a41',
        quantity_on_hand: 10,
      },
      {
        productId: 'e7a23cbb-4c59-4233-8d38-f2b82c3f949e',
        quantity_on_hand: 50,
      },
      {
        productId: '9f3e1a65-5af7-4d1a-a08b-6d7c78d8a19e',
        quantity_on_hand: 7,
      },
    ];

    for (const product of products) {
      const exists = await productRepo.findOne({
        where: { productId: product.productId },
      });

      if (!exists) {
        await productRepo.save(product);
      }
    }

    return { message: 'Sales Products seeded successfully' };
  }
}

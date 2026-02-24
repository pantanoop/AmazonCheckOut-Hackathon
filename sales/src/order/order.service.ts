import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Order } from './entities/order.entity';
import { OutboxMessage } from '../outbox/entities/outbox-table.entity';
import { Product } from '../order/entities/product.entity';

@Injectable()
export class OrderService {
  constructor(private readonly dataSource: DataSource) {}

  async createOrder(input: {
    orderId: string;
    customerId: string;
    products: { productId: string; quantity: number }[];
  }): Promise<Order> {
    const orderRepo = this.dataSource.getRepository(Order);
    const productRepo = this.dataSource.getRepository(Product);
    const products = input.products;
    let orderTotal = 0;

    const existing = await orderRepo.findOne({
      where: { orderId: input.orderId },
    });

    if (existing) {
      throw new BadRequestException('Order already exists');
    }
    for (const product of products) {
      const exists = await productRepo.findOne({
        where: { productId: product.productId },
      });

      if (!exists) {
        throw new NotFoundException('Product not found');
      }
      orderTotal = orderTotal + exists.price * product.quantity;
    }

    const order = orderRepo.create({
      orderId: input.orderId,
      customerId: input.customerId,
      orderTotal: orderTotal,
      products: input.products,
      status: 'PENDING',
    });

    return orderRepo.save(order);
  }

  async placeOrder(orderId: string): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const outboxRepo = manager.getRepository(OutboxMessage);

      const order = await orderRepo.findOne({
        where: { orderId: orderId },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== 'PENDING') {
        throw new BadRequestException(
          `Order cannot be placed from status ${order.status}`,
        );
      }

      order.status = 'PLACED';
      await orderRepo.save(order);

      const outbox = outboxRepo.create({
        messageId: uuidv4(),
        eventType: 'order.placed',
        messagePayload: {
          orderId: order.orderId,
          orderTotal: order.orderTotal,
        },
        status: 'PENDING',
      });

      await outboxRepo.save(outbox);

      return order;
    });
  }

  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string[];
  }): Promise<Order[]> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 50;

    const qb = this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('order.createdAt', 'DESC');

    if (params.status?.length) {
      qb.andWhere('order.status IN (:...status)', {
        status: params.status,
      });
    }

    return qb.getMany();
  }

  async seedProductInformation() {
    const productRepo = this.dataSource.getRepository(Product);

    const products = [
      {
        productId: 'b17f77ae-5d5d-4183-a1f5-979c45a5f57f',
        price: 89.99,
      },
      {
        productId: '2b8a7b36-fb21-4ad8-a124-25d607c3e55c',
        price: 59.99,
      },
      {
        productId: '7c91f4b0-8d42-47f1-98c4-b3f975be3a41',
        price: 149.99,
      },
      {
        productId: 'e7a23cbb-4c59-4233-8d38-f2b82c3f949e',
        price: 19.99,
      },
      {
        productId: '9f3e1a65-5af7-4d1a-a08b-6d7c78d8a19e',
        price: 299.99,
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

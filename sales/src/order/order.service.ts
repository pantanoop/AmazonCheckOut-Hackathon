import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Order } from './entities/order.entity';
import { OutboxMessage } from '../outbox/entities/outbox-table.entity';

@Injectable()
export class OrderService {
  constructor(private readonly dataSource: DataSource) {}

  async createOrder(input: {
    orderId: string;
    customerId: string;
    products: { productId: string; quantity: number }[];
    orderTotal: number;
    billingAccountId: string;
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
      customerId: input.customerId,
      products: input.products,
      orderTotal: input.orderTotal,
      status: 'PENDING',
    });

    return orderRepo.save(order);
  }

  async placeOrder(input: {
    orderId: string;
    customerId: string;
    products: { productId: string; quantity: number }[];
    orderTotal: number;
    billingAccountId: string;
  }): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const outboxRepo = manager.getRepository(OutboxMessage);

      const order = await orderRepo.findOne({
        where: { orderId: input.orderId },
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
        id: uuidv4(),
        eventType: 'order.placed',
        messagePayload: {
          orderId: order.orderId,
          orderTotal: order.orderTotal,
          billingAccountId: input.billingAccountId,
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
}

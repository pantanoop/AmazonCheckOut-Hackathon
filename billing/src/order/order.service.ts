import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Order } from './entities/order.entity';
import { OutboxMessage } from '../outbox/entities/outbox-table.entity';
import { BillingAccount } from '../billing/entities/billing-account.entity';

@Injectable()
export class OrderService {
  constructor(private readonly dataSource: DataSource) {}

  async createOrder(input: {
    orderId: string;
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
      billingAccountId: input.billingAccountId,
    });

    return orderRepo.save(order);
  }

  async seedAccountInformation() {
    const billingRepo = this.dataSource.getRepository(BillingAccount);
    const accounts = [
      {
        billingAccountId: 'c1d7a1b4-6ef3-44a2-b97f-3a7e2f405bd4',
        cardNumber: '4111111111111111',
        balance: 120.5,
      },
      {
        billingAccountId: 'a2f89d3c-b671-4fd6-88cd-f8cdb66f09e1',
        cardNumber: '5500000000000004',
        balance: 250.75,
      },
      {
        billingAccountId: 'f3e7c5d1-6c82-4a28-bb8e-0d3f78f3ab90',
        cardNumber: '4111222233334444',
        balance: 89.3,
      },
      {
        billingAccountId: 'd4b2f843-8e6b-4f57-9b4f-5a4c5a73b512',
        cardNumber: '5424000000000015',
        balance: 480,
      },
      {
        billingAccountId: 'e5c6d3a7-7da2-4db8-bc44-3b3b84b2a9f0',
        cardNumber: '4532015112830366',
        balance: 310.2,
      },
    ];

    for (const account of accounts) {
      const exists = await billingRepo.findOne({
        where: { billingAccountId: account.billingAccountId },
      });

      if (!exists) {
        await billingRepo.save(account);
      }
    }

    return { message: 'Billing accounts seeded successfully' };
  }
}

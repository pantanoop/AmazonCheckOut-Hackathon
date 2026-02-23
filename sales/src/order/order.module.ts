import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OutboxMessage } from '../outbox/entities/outbox-table.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OutboxMessage])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrdersController } from './order/order.controller';

@Module({
  imports: [HttpModule],
  controllers: [OrdersController],
})
export class AppModule {}

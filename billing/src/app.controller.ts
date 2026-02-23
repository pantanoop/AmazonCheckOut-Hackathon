import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('billing')
export class AppController implements OnModuleInit {
  constructor(private readonly appService: AppService) {
    console.log('AppController CONSTRUCTOR');
  }

  onModuleInit() {
    console.log('AppController LOADED');
  }

  @Get('seed')
  seedAccountInformation() {
    console.log('/billing/seed HIT');
    return this.appService.seedAccountInformation();
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserService } from './create-user.service';

@Controller('create-user')
export class CreateUserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post()
  async create(@Body() body: { name: string; email: string }) {
    return this.createUserService.create(body);
  }
}

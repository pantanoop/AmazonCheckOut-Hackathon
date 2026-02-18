import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { CreateUserModule } from './create-user/create-user.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), CreateUserModule],
})
export class AppModule {}

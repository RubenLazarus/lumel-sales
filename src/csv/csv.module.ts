import { Module } from '@nestjs/common';
import { CsvController } from './csv.controller';
import { CsvService } from './csv.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customers } from 'src/common/entities/customers.entity';
import { Products } from 'src/common/entities/products.entity';
import { Orders } from 'src/common/entities/orders.entity';
import { OrderDetails } from 'src/common/entities/order-details.entity';
import { Services } from 'src/utils/constants';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ScheduleModule } from '@nestjs/schedule';
import { CsvCronService } from './csv.cron.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customers, Products, Orders, OrderDetails]),
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
    ScheduleModule.forRoot(),
    CommonModule
  ],
  controllers: [CsvController],
  providers: [{ provide: Services.CSV, useClass: CsvService }, CsvCronService]
})
export class CsvModule { }

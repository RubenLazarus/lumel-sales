import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { Services } from 'src/utils/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from 'src/common/entities/orders.entity';
import { OrderDetails } from 'src/common/entities/order-details.entity';
import { Products } from 'src/common/entities/products.entity';
import { Customers } from 'src/common/entities/customers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customers, Products, Orders, OrderDetails]),],
  controllers: [AnalysisController],
  providers: [{ provide: Services.ANALYSIS, useClass: AnalysisService }]
})
export class AnalysisModule { }

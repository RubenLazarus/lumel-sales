import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { CsvModule } from './csv/csv.module';
import { OrdersModule } from './orders/orders.module';
import { CustomersModule } from './customers/customers.module';
import { ProductsModule } from './products/products.module';
import { OrderDetailsModule } from './order-details/order-details.module';

@Module({
  imports: [   
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, // Set to false in production
    }),
    CommonModule,
    CsvModule,
    OrdersModule,
    CustomersModule,
    ProductsModule,
    OrderDetailsModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

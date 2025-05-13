import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDetails } from 'src/common/entities/order-details.entity';
import { Orders } from 'src/common/entities/orders.entity';
import { Products } from 'src/common/entities/products.entity';
import { RevenueType } from 'src/utils/enum';
import { Repository } from 'typeorm';

@Injectable()
export class AnalysisService {
    constructor(
        @InjectRepository(Orders) private readonly ordersRepo: Repository<Orders>,
        @InjectRepository(OrderDetails) private readonly orderDetailsRepo: Repository<OrderDetails>,
        @InjectRepository(Products) private readonly productsRepo: Repository<Products>,
    ) { }


    async calculateRevenue(query) {
        const { startDate, endDate, type, period } = query;

        switch (type) {
            case RevenueType.TOTAL:
                return this.getTotalRevenue(startDate, endDate);
            case RevenueType.PRODUCT:
                return this.getRevenueByProduct(startDate, endDate);
            case RevenueType.CATEGORY:
                return this.getRevenueByCategory(startDate, endDate);
            case RevenueType.REGION:
                return this.getRevenueByRegion(startDate, endDate);
            // case RevenueType.TREND:
            //     if (!period) throw new Error('Period is required for trend analysis');
            //     return this.getRevenueTrends(startDate, endDate, period);
            default:
                throw new Error('Invalid revenue type');
        }
    }

    private async getTotalRevenue(startDate, endDate) {
        const result = await this.orderDetailsRepo
            .createQueryBuilder('od')
            .leftJoin('od.product', 'p')
            .leftJoin('od.order', 'o') // <-- Join to access order_date
            .where('o.order_date BETWEEN :startDate AND :endDate', { startDate, endDate })
            .select('SUM(p.unit_price * od.quantity * (1 - od.discount))', 'total')
            .getRawMany();

        return result? result[0] :{};
    }

    private async getRevenueByProduct(startDate, endDate) {
        return await this.orderDetailsRepo
            .createQueryBuilder('od')
            .select('p.name', 'product_name')
            .select('p.id','product_id')
            .addSelect('SUM(od.quantity * p.unit_price * (1 - od.discount))', 'revenue')
            .innerJoin('od.product', 'p')
            .innerJoin('od.order', 'o')
            .where('o.order_date BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('p.id')
            .orderBy('revenue', 'DESC')
            .getRawMany();
    }

    private async getRevenueByCategory(startDate, endDate) {
        return await this.orderDetailsRepo
            .createQueryBuilder('od')
            .select('p.category', 'category')
            .addSelect('SUM(od.quantity * p.unit_price * (1 - od.discount))', 'revenue')
            .innerJoin('od.product', 'p')
            .innerJoin('od.order', 'o')
            .where('o.order_date BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('p.category')
            .orderBy('revenue', 'DESC')
            .getRawMany();
    }

    private async getRevenueByRegion(startDate, endDate) {
        return await this.orderDetailsRepo
            .createQueryBuilder('od')
            .select('o.region', 'region')
            .addSelect('SUM(od.quantity * p.unit_price * (1 - od.discount))', 'revenue')
            .innerJoin('od.product', 'p')
            .innerJoin('od.order', 'o')
            .where('o.order_date BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('o.region')
            .orderBy('revenue', 'DESC')
            .getRawMany();
    }
}

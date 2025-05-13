import { BadRequestException, Injectable } from '@nestjs/common';
import { Customers } from 'src/common/entities/customers.entity';
import { OrderDetails } from 'src/common/entities/order-details.entity';
import { Orders } from 'src/common/entities/orders.entity';
import { Products } from 'src/common/entities/products.entity';
import { DataSource, QueryRunner } from 'typeorm';
import * as csvParser from 'csv-parser';
import { ICsvService } from './csv';
import { Readable } from 'stream';
import { DateTime } from 'luxon';
@Injectable()
export class CsvService implements ICsvService {

    private readonly BATCH_SIZE = 1000;
    constructor(
        private readonly dataSource: DataSource
    ) { }

    async processCSV(buffer: Buffer) {

        // Stream processing with batching
        await this.streamAndProcessCSV(buffer);

        return { message: 'Data ingested successfully!' };
    }

    private async streamAndProcessCSV(buffer: Buffer) {
        const stream = Readable.from(buffer);
        let batch = [];

        stream.pipe(csvParser())
            .on('data', async (row) => {
                const transformedRow = this.transformRow(row);
                batch.push(transformedRow);

                if (batch.length >= this.BATCH_SIZE) {
                    stream.pause();
                    await this.updateBatch(batch);
                    batch = [];
                    stream.resume();
                }
            })
            .on('end', async () => {
                if (batch.length > 0) {
                    await this.updateBatch(batch);
                }
            })
            .on('error', (error) => {
                throw new BadRequestException(error.message);
            });
    }

    private async updateBatch(batch) {
        const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            for (const row of batch) {
                // 1. Update Customer if exists
                const customerId = row.customer_id;
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(Customers)
                    .set({
                        name: row.customer_name,
                        address: row.customer_address
                    })
                    .where('id = :id', { id: customerId })
                    .execute();



                // 2. Update Product if exists
                const productId = row.product_id;
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(Products)
                    .set({
                        name: row.product_name,
                        category: row.category,
                        unit_price: row.unit_price,
                    })
                    .where('id = :id', { id: productId })
                    .execute();



                // 3. Update Order if exists
                const orderId = row['Order ID'];
                const orderExists = await queryRunner.manager.findOne(Orders, { where: { id: orderId } });
                if (orderExists) {
                    await queryRunner.manager
                        .createQueryBuilder()
                        .update(Orders)
                        .set({
                            order_date: row.order_date,
                            region: row.region,
                            payment_method: row.payment_method,
                            shipping_cost: row.shipping_cost
                        })
                        .where('id = :id', { id: orderId })
                        .execute();
                }

                // 4. Update Order Details if exists else insert 
                const orderDetailExists = await queryRunner.manager.findOne(OrderDetails, {
                    where: {
                        order: { id: orderId },
                        product: { id: productId },
                    },
                });

                if (orderDetailExists) {
                    await queryRunner.manager
                        .createQueryBuilder()
                        .update(OrderDetails)
                        .set({
                            quantity: row.quantity,
                            discount: row.discount
                        })
                        .where('order_id = :order_id AND product_id = :product_id', {
                            order_id: orderId,
                            product_id: productId
                        })
                        .execute();
                } else {
                    await queryRunner.manager
                        .createQueryBuilder()
                        .insert()
                        .into(OrderDetails)
                        .values({
                            order: orderId,
                            product: productId,
                            quantity: row.quantity,
                            discount: row.discount
                        })
                        .execute();
                }
            }
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException(`Update failed: ${error.message}`);
        } finally {
            await queryRunner.release();
        }
    }

    private transformRow(row) {
        return {
            order_id: row['Order ID'],
            product_id: row['Product ID'],
            customer_id: row['Customer ID'],
            product_name: row['Product Name'],
            category: row['Category'],
            region: row['Region'],
            order_date: row['Date of Sale'],
            quantity: parseInt(row['Quantity Sold'], 10),
            unit_price: parseFloat(row['Unit Price']),
            discount: parseFloat(row['Discount']),
            shipping_cost: parseFloat(row['Shipping Cost']),
            payment_method: row['Payment Method'],
            customer_name: row['Customer Name'],
            customer_email: row['Customer Email'],
            customer_address: row['Customer Address'],
        };
    }
}

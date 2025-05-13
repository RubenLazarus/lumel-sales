import { BadRequestException, Injectable } from '@nestjs/common';
import { Customers } from 'src/common/entities/customers.entity';
import { OrderDetails } from 'src/common/entities/order-details.entity';
import { Orders } from 'src/common/entities/orders.entity';
import { Products } from 'src/common/entities/products.entity';
import { DataSource, QueryRunner } from 'typeorm';
import * as csvParser from 'csv-parser';
import { ICsvService } from './csv';
import { Readable } from 'stream';
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
                batch.push(row);

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
                const customerId = row['Customer ID'];
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(Customers)
                    .set({
                        name: row['Customer Name'],
                        address: row['Customer Address']
                    })
                    .where('id = :id', { id: customerId })
                    .execute();



                // 2. Update Product if exists
                const productId = row['Product ID'];
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(Products)
                    .set({
                        name: row['Product Name'],
                        category: row['Category'],
                        unit_price: parseFloat(row['Unit Price'])
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
                            order_date: row['Date of Sale'],
                            region: row['Region'],
                            payment_method: row['Payment Method'],
                            shipping_cost: parseFloat(row['Shipping Cost'])
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
                            quantity: parseInt(row['Quantity Sold']),
                            discount: parseFloat(row['Discount'])
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
                            quantity: parseInt(row['Quantity Sold']),
                            discount: parseFloat(row['Discount'])
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
}

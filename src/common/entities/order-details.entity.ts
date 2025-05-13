import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Orders } from './orders.entity';
import { Products } from './products.entity';

@Entity()
export class OrderDetails {
    @PrimaryGeneratedColumn('uuid')
    id: string;

@ManyToOne(() => Orders, (order) => order.orderDetails, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'order_id' }) // Optional: for custom column naming
  order: Orders;

  @ManyToOne(() => Products, (product) => product.orderDetails, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'product_id' }) // Optional: for custom column naming
  product: Products;
    
    @Column()
    quantity: number;

    @Column('decimal', { precision: 5, scale: 2, default: 0 })
    discount: number;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Customers } from './customers.entity';
import { OrderDetails } from './order-details.entity';

@Entity()
export class Orders {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customers, (customer) => customer.orders, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'customer_id' }) // Creates a clear FK column
  customer: Customers;

  @OneToMany(() => OrderDetails, (orderDetail) => orderDetail.order)
  orderDetails: OrderDetails[];

  @Column({ type: 'date' })
  order_date: string;

  @Column()
  region: string;

  @Column()
  payment_method: string;

  @Column('decimal', { precision: 10, scale: 2 })
  shipping_cost: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}

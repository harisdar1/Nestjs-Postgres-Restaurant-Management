import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

// PRICE SNAPSHOT PATTERN:
// This entity stores a copy of the menu item data at the time of order.
// Even if the restaurant changes the price later, this order keeps the original price.
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Snapshot of menu item at order time
  @Column()
  menuItemId: string; // Reference to original menu item

  @Column()
  name: string; // Copied from MenuItem

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Copied from MenuItem - THIS IS THE SNAPSHOT!

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number; // price * quantity

  // Order relationship
  @Column()
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;
}

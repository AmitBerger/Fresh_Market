// src/products/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 }) // חשוב למחירים!
  price: number;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ name: 'stock_quantity', default: 0 })
  stockQuantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
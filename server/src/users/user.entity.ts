import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Order } from '../orders/order.entity';
import { Cart } from '../carts/cart.entity';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true }) 
  password: string;

  @Column({ nullable: true })
  googleId: string;

  // הוספנו nullable: true כדי למנוע את הקריסה בגלל נתונים ישנים
  @Column({ nullable: true })
  firstName: string;

  // הוספנו nullable: true כדי למנוע את הקריסה בגלל נתונים ישנים
  @Column({ nullable: true })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
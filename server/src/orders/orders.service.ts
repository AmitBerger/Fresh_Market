import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CartsService } from '../carts/carts.service';
import { ProductsService } from '../products/products.service';
import { User } from '../users/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private cartsService: CartsService,
    private productsService: ProductsService,
    private dataSource: DataSource,
  ) {}

  // יצירת הזמנה (הקוד הקודם)
  async createOrder(userId: number) {
    const cart = await this.cartsService.getCart(userId);

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;

      for (const item of cart.items) {
        const product = await this.productsService.findOne(item.product.id);
        if (!product) {
          throw new BadRequestException(
            `Product with id ${item.product.id} not found`,
          );
        }
        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(`Not enough stock for ${product.name}`);
        }
        totalAmount += Number(product.price) * item.quantity;
        product.stockQuantity -= item.quantity;
        await queryRunner.manager.save(product);
      }

      const order = this.ordersRepository.create({
        user: { id: userId } as User,
        totalAmount,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await queryRunner.manager.save(order);

      const orderItems = cart.items.map((item) => {
        return queryRunner.manager.create(OrderItem, {
          order: savedOrder,
          product: item.product,
          quantity: item.quantity,
          priceAtPurchase: item.product.price,
        });
      });

      await queryRunner.manager.save(orderItems);
      await queryRunner.query(
        `DELETE FROM cart_items WHERE cart_id = ${cart.id}`,
      );

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // --- הפונקציה החדשה להיסטוריית הזמנות ---
  async findAllByUserId(userId: number): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'], // טוען את הפריטים והמוצרים
      order: { createdAt: 'DESC' }, // ממיין מהחדש לישן
    });
  }
}

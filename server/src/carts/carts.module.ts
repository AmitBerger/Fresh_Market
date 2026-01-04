import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module'; // נצטרך את זה כדי לקשר למשתמש

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    ProductsModule,
    UsersModule
  ],
  providers: [CartsService],
  controllers: [CartsController],
  exports: [CartsService]
})
export class CartsModule {}
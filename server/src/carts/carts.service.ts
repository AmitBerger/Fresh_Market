import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { User } from '../users/user.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemsRepository: Repository<CartItem>,
    private productsService: ProductsService,
  ) {}

  async getCart(userId: number): Promise<Cart> {
    let cart = await this.cartsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { items: { id: 'ASC' } } // כדי שהסדר לא יקפוץ בשינוי כמות
    });

    if (!cart) {
      cart = this.cartsRepository.create({ user: { id: userId } as User });
      await this.cartsRepository.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async addToCart(userId: number, productId: number, quantity: number) {
    const cart = await this.getCart(userId);
    const product = await this.productsService.findOne(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let cartItem = await this.cartItemsRepository.findOne({
      where: { cart: { id: cart.id }, product: { id: productId } },
    });

    const currentQuantityInCart = cartItem ? cartItem.quantity : 0;

    if (currentQuantityInCart + quantity > product.stockQuantity) {
        throw new BadRequestException(`Cannot add more items. Max stock reached (${product.stockQuantity})`);
    }

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = this.cartItemsRepository.create({
        cart,
        product,
        quantity,
      });
    }

    return this.cartItemsRepository.save(cartItem);
  }

  // --- הפונקציה החדשה לשינוי כמות (+/-) ---
  async updateCartItem(userId: number, cartItemId: number, newQuantity: number) {
    const cart = await this.getCart(userId);
    
    const cartItem = await this.cartItemsRepository.findOne({
      where: { id: cartItemId, cart: { id: cart.id } },
      relations: ['product'],
    });

    if (!cartItem) throw new NotFoundException('Item not found in cart');

    if (newQuantity <= 0) {
      // אם הכמות ירדה ל-0 או פחות, נמחק את הפריט
      return this.removeFromCart(userId, cartItemId);
    }

    // בדיקת מלאי לפני עדכון
    if (newQuantity > cartItem.product.stockQuantity) {
      throw new BadRequestException(`Not enough stock. Max available: ${cartItem.product.stockQuantity}`);
    }

    cartItem.quantity = newQuantity;
    return this.cartItemsRepository.save(cartItem);
  }

  async removeFromCart(userId: number, cartItemId: number) {
     const cart = await this.getCart(userId);
     return this.cartItemsRepository.delete({ id: cartItemId, cart: { id: cart.id } });
  }
}
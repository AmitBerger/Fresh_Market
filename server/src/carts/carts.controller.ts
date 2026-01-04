import { Controller, Get, Post, Delete, Patch, Body, Param, Request, UseGuards } from '@nestjs/common';
import { CartsService } from './carts.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  getCart(@Request() req) {
    return this.cartsService.getCart(req.user.userId);
  }

  @Post('add')
  addToCart(@Request() req, @Body() body: { productId: number; quantity: number }) {
    return this.cartsService.addToCart(req.user.userId, body.productId, body.quantity);
  }

  // עדכון כמות (PATCH)
  @Patch(':itemId')
  updateItem(@Request() req, @Param('itemId') itemId: string, @Body() body: { quantity: number }) {
    return this.cartsService.updateCartItem(req.user.userId, +itemId, body.quantity);
  }

  @Delete(':itemId')
  removeFromCart(@Request() req, @Param('itemId') itemId: string) {
    return this.cartsService.removeFromCart(req.user.userId, +itemId);
  }
}
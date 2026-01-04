import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Request() req) {
    return this.ordersService.createOrder(req.user.userId);
  }

  // הנתיב החדש לקבלת ההיסטוריה
  @Get()
  getUserOrders(@Request() req) {
    return this.ordersService.findAllByUserId(req.user.userId);
  }
}
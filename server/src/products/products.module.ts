import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity'; // וודא שהנתיב נכון

@Module({
  imports: [TypeOrmModule.forFeature([Product])], // <--- קריטי!
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService] // שנצטרך להזמנות בהמשך
})
export class ProductsModule {}
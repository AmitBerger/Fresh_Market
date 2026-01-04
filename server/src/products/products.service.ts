import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  // פונקציה למציאת מוצר בודד (נצטרך לעגלה ולפרטי מוצר)
  async findOne(id: number): Promise<Product | null> {
    return this.productsRepository.findOneBy({ id });
  }
}
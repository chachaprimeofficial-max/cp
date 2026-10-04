import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.schema';

@Controller('products')
export class ProductsController {
  constructor(@InjectModel(Product.name) private readonly model: Model<Product>) {}

  @Get()
  async find(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '24',
  ) {
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(60, Math.max(1, Number(limit) || 24));
    const filter: Record<string, unknown> = { isActive: true };

    if (category) filter.categoryId = category;
    if (q?.trim()) {
      const search = q.trim().replace(/[.*+?^()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ featured: -1, createdAt: -1 })
        .skip((currentPage - 1) * pageSize).limit(pageSize).lean(),
      this.model.countDocuments(filter),
    ]);

    return { items, pagination: { page: currentPage, limit: pageSize, total, pages: Math.ceil(total / pageSize) } };
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const product = await this.model.findOne({ slug, isActive: true }).lean();
    if (!product) throw new NotFoundException('Product not found.');
    return product;
  }
}

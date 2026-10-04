import {
  Body, ConflictException, Controller, Delete, Get, NotFoundException,
  Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() dto: CreateProductDto) {
    const slug = dto.slug.trim().toLowerCase();
    const exists = await this.model.exists({ slug });
    if (exists) throw new ConflictException('A product with this slug already exists.');
    return this.model.create({ ...dto, name: dto.name.trim(), slug });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const update: Record<string, unknown> = { ...dto };
    if (dto.name) update.name = dto.name.trim();
    if (dto.slug) {
      const slug = dto.slug.trim().toLowerCase();
      const exists = await this.model.exists({ slug, _id: { $ne: id } });
      if (exists) throw new ConflictException('A product with this slug already exists.');
      update.slug = slug;
    }
    const product = await this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
    if (!product) throw new NotFoundException('Product not found.');
    return product;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async archive(@Param('id') id: string) {
    const product = await this.model.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean();
    if (!product) throw new NotFoundException('Product not found.');
    return { ok: true, product };
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const product = await this.model.findOne({ slug, isActive: true }).lean();
    if (!product) throw new NotFoundException('Product not found.');
    return product;
  }
}

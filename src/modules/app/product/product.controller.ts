import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

// @ApiBearerAuth()
@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @ApiOperation({ summary: 'Find all products' })
  @Get()
  async findAll() {
    const products = await this.productService.findAll();

    return products.data;
  }

  @ApiOperation({ summary: 'Find All Category List' })
  @Get('/category-list')
  async getCategoryList() {
    const categoryList = await this.productService.getCategoryList();
    return categoryList.data;
  }

  @ApiOperation({ summary: 'Find Product by Category id' })
  @Get(':categoryId')
  async getCategoryProducts(@Param('categoryId') category: string) {
    const categoryProduct =
      await this.productService.getCategoryProducts(category);
    return categoryProduct.data;
  }

  @ApiOperation({ summary: 'Find one product' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(id);

    return product.data;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}

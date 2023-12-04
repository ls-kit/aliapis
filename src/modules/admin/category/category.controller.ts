import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Category')
@Controller('admin/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Create category' })
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      const result = await this.categoryService.create(createCategoryDto);

      return {
        success: true,
        message: 'Category successfully created',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiOperation({ summary: 'Find all categories' })
  @Get()
  async findAll() {
    const result = await this.categoryService.findAll();

    return {
      success: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'Find one category' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.categoryService.findOne(+id);

    return {
      success: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'Update category' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    try {
      const result = await this.categoryService.update(+id, updateCategoryDto);

      return {
        success: true,
        message: 'Category successfully updated',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiOperation({ summary: 'Delete category' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const result = await this.categoryService.remove(+id);

      return {
        success: true,
        message: 'Category successfully deleted',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../../../providers/prisma/prisma.service';

@Injectable()
export class CategoryService extends PrismaClient {
  constructor(private prisma: PrismaService) {
    super();
  }
  async create(createCategoryDto: CreateCategoryDto) {
    const data = {};
    if (createCategoryDto.name) {
      data['name'] = createCategoryDto.name;
      data['slug'] = createCategoryDto.name.toLowerCase().split(' ').join('-');
    }
    if (createCategoryDto.description) {
      data['description'] = createCategoryDto.description;
    }

    const category = await this.prisma.category.create({
      data: {
        ...data,
      },
    });

    return category;
  }

  async findAll() {
    const categories = await this.prisma.category.findMany();
    return categories;
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: id,
      },
    });
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const data = {};
    if (updateCategoryDto.name) {
      data['name'] = updateCategoryDto.name;
      data['slug'] = updateCategoryDto.name.toLowerCase().split(' ').join('-');
    }
    if (updateCategoryDto.description) {
      data['description'] = updateCategoryDto.description;
    }

    const category = await this.prisma.category.update({
      where: {
        id: id,
      },
      data: {
        ...data,
      },
    });
    return category;
  }

  async remove(id: number) {
    const category = await this.prisma.category.delete({
      where: {
        id: id,
      },
    });
    return category;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../../../common/repository/user/user.repository';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService extends PrismaClient {
  constructor(private prisma: PrismaService) {
    super();
  }

  async create(createTenantDto: CreateTenantDto) {
    const tenant = await this.prisma.user.create({
      data: {
        username: createTenantDto.username,
        email: createTenantDto.email,
      },
    });
    return tenant;
  }

  async findAll() {
    const tenants = await this.prisma.user.findMany();
    return tenants;
  }

  findOne(id: number) {
    return `This action returns a #${id} tenant`;
  }

  update(id: number, updateTenantDto: UpdateTenantDto) {
    return `This action updates a #${id} tenant`;
  }

  remove(id: number) {
    return `This action removes a #${id} tenant`;
  }

  async usernameExist(username) {
    const checkUsername = await UserRepository.exist({
      field: 'username',
      value: username,
    });

    return checkUsername;
  }
  async emailExist(email) {
    const checkEmail = await UserRepository.exist({
      field: 'email',
      value: email,
    });

    return checkEmail;
  }
  async domainExist(domain) {
    const checkDomain = await UserRepository.exist({
      field: 'domain',
      value: domain,
    });

    return checkDomain;
  }
}

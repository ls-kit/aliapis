import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DateHelper } from '../../../common/helper/date.helper';
import { UserRepository } from '../../../common/repository/user/user.repository';
import { PrismaService } from '../../../providers/prisma/prisma.service';

@Injectable()
export class StripeService extends PrismaClient {
  constructor(private prisma: PrismaService) {
    super();
  }
}

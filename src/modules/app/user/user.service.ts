import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { DateHelper } from '../../../common/helper/date.helper';
import { UcodeRepository } from '../../../common/repository/ucode/ucode.repository';
import { MailService } from '../../../providers/mail/mail.service';
import { UserRepository } from '../../../common/repository/user/user.repository';
import appConfig from '../../../config/app.config';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService extends PrismaClient {
  constructor(
    private prisma: PrismaService,
    private readonly mailService: MailService,
  ) {
    super();
  }

  async me({ userId }) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        fname: true,
        lname: true,
        username: true,
        email: true,
        avatar: true,
        role_users: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (user) {
      // const excludedData = PrismaHelper.exclude(user, ['password']);
      return user;
    } else {
      return false;
    }
  }

  // invite a member
  async create(createUserDto: CreateUserDto, user_id) {
    const userDetails = await UserRepository.getUserDetails(user_id);
    // Check if email and username is exists
    const userEmailExist = await UserRepository.exist({
      field: 'email',
      value: String(createUserDto.email),
    });

    if (userEmailExist) {
      return {
        error: true,
        statusCode: 401,
        message: 'Email already exist',
      };
    }

    const userUserExist = await UserRepository.exist({
      field: 'username',
      value: String(createUserDto.username),
    });

    if (userUserExist) {
      return {
        statusCode: 401,
        message: 'Username already exist',
      };
    }

    const member = await UserRepository.inviteUser({
      fname: createUserDto.fname,
      lname: createUserDto.lname,
      username: createUserDto.username,
      email: createUserDto.email,
      role_id: createUserDto.role_id,
    });

    if (member) {
      // send invitation mail to user
      const expired_at = DateHelper.add(7, 'days').toDate();
      const ucode = await UcodeRepository.createToken({
        userId: member.id,
        expired_at: expired_at,
      });

      return {
        data: member,
        success: true,
        message: 'User has been invited successfully',
      };
    } else {
      return {
        error: true,
        message: 'User not created. something went wrong',
      };
    }
  }

  async findAll(userId: number) {
    const user = await this.prisma.user.findMany();
    return user;
  }

  async findOne(id: number, userId) {
    const user = await this.prisma.user.findFirst({
      where: {
        AND: [
          {
            id: id,
          },
        ],
      },
      include: {
        role_users: {
          include: {
            role: true,
          },
        },
      },
    });
    return user;
  }

  async update(id: number, userId: number, updateUserDto: UpdateUserDto) {
    return this.prisma.$transaction(async () => {
      const user = await this.prisma.user.updateMany({
        where: {
          AND: [
            {
              id: id,
            },
          ],
        },
        data: {
          fname: updateUserDto.fname,
          lname: updateUserDto.lname,
          username: updateUserDto.username,
          email: updateUserDto.email,
        },
      });
      if (user) {
        await UserRepository.syncRole({
          user_id: id,
          role_id: updateUserDto.role_id,
        });
        return user;
      }
    });
  }

  async remove(id: number, userId) {
    return 'delete something';
  }

  async setPassword({ userId, password }) {
    userId = Number(userId);
    const hashedPasssword = await bcrypt.hash(
      password,
      appConfig().security.salt,
    );
    const user = await UserRepository.getUserDetails(userId);
    if (user) {
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          password: hashedPasssword,
        },
      });
      return user;
    } else {
      return false;
    }
  }
}

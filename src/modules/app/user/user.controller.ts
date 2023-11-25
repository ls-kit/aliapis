import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpException,
  Req,
} from '@nestjs/common';
import appConfig from '../../../config/app.config';
import { SignedUrlGuard } from 'nestjs-url-generator';
import { UcodeRepository } from '../../../common/repository/ucode/ucode.repository';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from '../../../common/repository/user/user.repository';
import {
  AbilityFactory,
  Action,
} from '../../../providers/ability/ability.factory';
import { CheckAbilities } from '../../../providers/ability/abilities.decorator';
import { AbilitiesGuard } from '../../../providers/ability/abilities.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserEnum } from './entities/user.entity';

@ApiBearerAuth()
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Create, subject: 'User' })
  @Post()
  async create(@Req() req, @Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto, req.user.userId);
    if (user) {
      if (user.error) {
        return {
          error: true,
          message: user.message,
        };
      }
      return {
        success: true,
        message: user.message,
      };
    } else {
      return {
        error: true,
        message: user.message,
      };
    }
  }

  @ApiOperation({ summary: 'Get current user profile info' })
  @ApiResponse({ schema: { enum: [UserEnum] } })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req) {
    const data = await this.userService.me({ userId: req.user.userId });
    if (data) {
      return {
        data: data,
      };
    } else {
      return {
        error: true,
      };
    }
  }

  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: 'User' })
  @Get()
  async findAll(@Req() req) {
    const userId = req.user.userId;
    // const userDetails = await UserRepository.getUserDetails(userId);
    // const ability = this.abilityFactory.defineAbility(userDetails);
    // if (!ability.can(Action.Read, 'User')) {
    //   throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);
    // }
    const users = await this.userService.findAll(userId);
    return {
      data: users,
    };

    // try {
    //   ForbiddenError.from(ability)
    //     .setMessage('Access denied')
    //     .throwUnlessCan(Action.Read, 'User');

    //   return await this.userService.findAll(userId);
    // } catch (error) {
    //   if (error instanceof ForbiddenError) {
    //     throw new ForbiddenException(error.message);
    //   }
    // }
  }

  @ApiOperation({ summary: 'Find single user' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Show, subject: 'User' })
  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    const user_id = req.user.userId;
    const user = await this.userService.findOne(+id, user_id);
    if (user) {
      return {
        data: user,
      };
    } else {
      return {
        error: true,
        message: 'User not found',
      };
    }
  }

  @ApiOperation({ summary: 'Update user' })
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Update, subject: 'User' })
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = req.user.userId;
    const user = await this.userService.update(+id, userId, updateUserDto);
    if (user) {
      return {
        success: true,
        message: 'Updated successfully',
      };
    } else {
      return {
        error: true,
        message: 'User not updated',
      };
    }
  }

  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Delete, subject: 'User' })
  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    return await this.userService.remove(+id, req);
  }

  @Get('invitation/:id')
  @UseGuards(SignedUrlGuard)
  async invitation(@Req() req, @Param('id') id: number) {
    try {
      const user = await UserRepository.getUserDetails(Number(id));
      // const user = await this.userService.me({ userId: id });
      if (user.password) {
        throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);
      } else {
        const token = req.query.token;
        const email = req.query.email;
        return {
          message: 'Set new password',
          url: `${
            appConfig().app.client_app_url
          }/user/${id}/invitation/confirm?token=${token}&email=${email}`,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  // set new password via tenant invitation link
  @ApiOperation({ summary: 'Set new password' })
  @Patch(':id/password')
  async setPassword(@Req() req, @Param('id') id: number, @Body() body: any) {
    try {
      const token = body.token;
      const email = body.email;
      const password = body.password;

      if (!password) {
        if (password.length < 6) {
          return {
            error: true,
            message: 'Password must be at least 6 digit long!',
          };
        }
        return {
          error: true,
          message: 'Password not provided!',
        };
      }
      if (!email) {
        return {
          error: true,
          message: 'Email not provided!',
        };
      }
      if (!token) {
        return {
          error: true,
          message: 'Token not provided!',
        };
      }

      // validate token
      const validate = await UcodeRepository.validateToken({
        token: token,
        email: email,
      });
      if (validate) {
        // set new password
        const data = await this.userService.setPassword({
          userId: id,
          password: password,
        });
        if (data) {
          return {
            message: 'Password changed successfully',
          };
        } else {
          return {
            error: true,
            message: 'Password not changed',
          };
        }
      } else {
        return {
          error: true,
          message: 'Token invalid',
        };
      }
    } catch (error) {
      throw error;
      // return {
      //   error: true,
      //   message: 'Something went wrong :(',
      // };
    }
  }
}

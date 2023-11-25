import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ConflictException,
  UseGuards,
} from '@nestjs/common';
import { UrlGeneratorService } from 'nestjs-url-generator';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { MailService } from '../../../providers/mail/mail.service';
import { DateHelper } from '../../../common/helper/date.helper';
import { UcodeRepository } from '../../../common/repository/ucode/ucode.repository';
import { CheckAbilities } from '../../../providers/ability/abilities.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AbilitiesGuard } from '../../../providers/ability/abilities.guard';
import { Action } from '../../../providers/ability/ability.factory';

@Controller('tenant')
export class TenantController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly mailService: MailService,
    private readonly urlGeneratorService: UrlGeneratorService,
  ) {}

  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Create, subject: 'Tenant' })
  @Post()
  async create(@Body() createTenantDto: CreateTenantDto) {
    try {
      if (await this.tenantService.usernameExist(createTenantDto.username)) {
        throw new ConflictException('User already exist');
      }
      if (await this.tenantService.emailExist(createTenantDto.email)) {
        throw new ConflictException('Email already exist');
      }
      if (await this.tenantService.domainExist(createTenantDto.domain)) {
        throw new ConflictException('Domain already exist');
      }

      const tenant = await this.tenantService.create(createTenantDto);
      if (tenant) {
        const expired_at = DateHelper.add(7, 'days').toDate();
        const ucode = await UcodeRepository.createToken({
          userId: tenant.id,
          expired_at: expired_at,
        });
        const signed_url = this.urlGeneratorService.signUrl({
          relativePath: `user/invitation/${tenant.id}`,
          query: {
            token: ucode,
            email: tenant.email,
          },
          expirationDate: expired_at,
        });
        // send email to tenant
        await this.mailService.sendTenantInvitation({
          user: tenant,
          url: signed_url,
        });
        return {
          message: 'Tenant created successfully',
        };
      }
    } catch (error) {
      return {
        message: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: 'Tenant' })
  @Get()
  findAll() {
    return this.tenantService.findAll();
  }

  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Show, subject: 'Tenant' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Update, subject: 'Tenant' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantService.update(+id, updateTenantDto);
  }

  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Delete, subject: 'Tenant' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantService.remove(+id);
  }
}

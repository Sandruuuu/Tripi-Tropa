import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/interfaces/jwt-payload.interface';
import { SWAGGER_BEARER_AUTH } from '../common/swagger/swagger.constants';
import { ScheduleService } from '../admin/schedule.service';
import {
  CreateScheduleDto,
  ScheduleFilterDto,
  UpdateScheduleDto,
} from '../admin/dto/schedule.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('Vendors - Schedules')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('vendors/schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
export class VendorScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateScheduleDto) {
    return this.scheduleService.create(dto, user.transportType);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.scheduleService.findAll(query, user.transportType);
  }

  @Get('filter')
  findFilter(
    @CurrentUser() user: AuthUser,
    @Query() query: ScheduleFilterDto,
  ) {
    return this.scheduleService.findFilter(query, user.transportType);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.scheduleService.findOne(id, user.transportType);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(id, dto, user.transportType);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.scheduleService.remove(id, user.transportType);
  }
}

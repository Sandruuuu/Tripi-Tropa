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
import { CarriageService } from '../admin/carriage.service';
import {
  CarriageFilterDto,
  CreateCarriageDto,
  UpdateCarriageDto,
} from '../admin/dto/carriage.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('Vendors - Carriages')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('vendors/carriages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
export class VendorCarriageController {
  constructor(private readonly carriageService: CarriageService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCarriageDto) {
    return this.carriageService.create(dto, user.transportType);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.carriageService.findAll(query, user.transportType);
  }

  @Get('filter')
  findFilter(
    @CurrentUser() user: AuthUser,
    @Query() query: CarriageFilterDto,
  ) {
    return this.carriageService.findFilter(query, user.transportType);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.carriageService.findOne(id, user.transportType);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCarriageDto,
  ) {
    return this.carriageService.update(id, dto, user.transportType);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.carriageService.remove(id, user.transportType);
  }
}

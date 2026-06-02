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
import { TransportationService } from '../admin/transportation.service';
import {
  CreateTransportationDto,
  TransportationFilterDto,
  UpdateTransportationDto,
} from '../admin/dto/transportation.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('Vendors - Transportations')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('vendors/transportations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
export class VendorTransportationController {
  constructor(private readonly transportationService: TransportationService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTransportationDto,
  ) {
    return this.transportationService.create({
      ...dto,
      type: user.transportType!,
      vendorId: user.id,
    });
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.transportationService.findAll(query, user.transportType);
  }

  @Get('filter')
  findFilter(
    @CurrentUser() user: AuthUser,
    @Query() query: TransportationFilterDto,
  ) {
    return this.transportationService.findFilter(query, user.transportType);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.transportationService.findOne(id, user.transportType);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransportationDto,
  ) {
    return this.transportationService.update(id, dto, user.transportType);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.transportationService.remove(id, user.transportType);
  }
}

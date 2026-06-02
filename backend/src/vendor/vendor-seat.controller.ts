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
import { SeatService } from '../admin/seat.service';
import { CreateSeatDto, SeatFilterDto, UpdateSeatDto } from '../admin/dto/seat.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('Vendors - Seats')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('vendors/seats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
export class VendorSeatController {
  constructor(private readonly seatService: SeatService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateSeatDto) {
    return this.seatService.create(dto, user.transportType);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.seatService.findAll(query, user.transportType);
  }

  @Get('filter')
  findFilter(
    @CurrentUser() user: AuthUser,
    @Query() query: SeatFilterDto,
  ) {
    return this.seatService.findFilter(query, user.transportType);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.seatService.findOne(id, user.transportType);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSeatDto,
  ) {
    return this.seatService.update(id, dto, user.transportType);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.seatService.remove(id, user.transportType);
  }
}

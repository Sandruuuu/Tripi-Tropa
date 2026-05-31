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
import { SeatService } from './seat.service';
import { CreateSeatDto, SeatFilterDto, UpdateSeatDto } from './dto/seat.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SWAGGER_BEARER_AUTH } from '../common/swagger/swagger.constants';

@ApiTags('Admins - Seats')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('admins/seats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminSeatController {
  constructor(private readonly seatService: SeatService) {}

  @Post()
  create(@Body() dto: CreateSeatDto) {
    return this.seatService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.seatService.findAll(query);
  }

  @Get('filter')
  findFilter(@Query() query: SeatFilterDto) {
    return this.seatService.findFilter(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.seatService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSeatDto,
  ) {
    return this.seatService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.seatService.remove(id);
  }
}

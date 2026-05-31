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
import { TransportationService } from './transportation.service';
import {
  CreateTransportationDto,
  TransportationFilterDto,
  UpdateTransportationDto,
} from './dto/transportation.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SWAGGER_BEARER_AUTH } from '../common/swagger/swagger.constants';

@ApiTags('Admins - Transportations')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('admins/transportations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminTransportationController {
  constructor(private readonly transportationService: TransportationService) {}

  @Post()
  create(@Body() dto: CreateTransportationDto) {
    return this.transportationService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.transportationService.findAll(query);
  }

  @Get('filter')
  findFilter(@Query() query: TransportationFilterDto) {
    return this.transportationService.findFilter(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transportationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransportationDto,
  ) {
    return this.transportationService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.transportationService.remove(id);
  }
}

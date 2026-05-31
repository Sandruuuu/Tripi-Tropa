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
import { CarriageService } from './carriage.service';
import {
  CarriageFilterDto,
  CreateCarriageDto,
  UpdateCarriageDto,
} from './dto/carriage.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SWAGGER_BEARER_AUTH } from '../common/swagger/swagger.constants';

@ApiTags('Admins - Carriages')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('admins/carriages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminCarriageController {
  constructor(private readonly carriageService: CarriageService) {}

  @Post()
  create(@Body() dto: CreateCarriageDto) {
    return this.carriageService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.carriageService.findAll(query);
  }

  @Get('filter')
  findFilter(@Query() query: CarriageFilterDto) {
    return this.carriageService.findFilter(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.carriageService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCarriageDto,
  ) {
    return this.carriageService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.carriageService.remove(id);
  }
}

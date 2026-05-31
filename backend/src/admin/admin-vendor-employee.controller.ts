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
import { VendorEmployeeService } from './vendor-employee.service';
import {
  CreateVendorEmployeeDto,
  UpdateVendorEmployeeDto,
  VendorEmployeeFilterDto,
} from './dto/vendor-employee.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/interfaces/jwt-payload.interface';
import { SWAGGER_BEARER_AUTH } from '../common/swagger/swagger.constants';

@ApiTags('Admins - Vendor Employees')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('admins/vendor-employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminVendorEmployeeController {
  constructor(private readonly vendorEmployeeService: VendorEmployeeService) {}

  @Post()
  create(@Body() dto: CreateVendorEmployeeDto, @CurrentUser() user: AuthUser) {
    return this.vendorEmployeeService.create(dto, user.id);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.vendorEmployeeService.findAll(query);
  }

  @Get('filter')
  findFilter(@Query() query: VendorEmployeeFilterDto) {
    return this.vendorEmployeeService.findFilter(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vendorEmployeeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVendorEmployeeDto,
  ) {
    return this.vendorEmployeeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vendorEmployeeService.remove(id);
  }
}

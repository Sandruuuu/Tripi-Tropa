import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminTransactionService } from './admin-transaction.service';
import {
  TransactionFilterDto,
  UpdateTransactionStatusDto,
} from './dto/transaction.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SWAGGER_BEARER_AUTH } from '../common/swagger/swagger.constants';

@ApiTags('Admins - Transactions')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('admins/transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminTransactionController {
  constructor(
    private readonly adminTransactionService: AdminTransactionService,
  ) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.adminTransactionService.findAll(query);
  }

  @Get('filter')
  findFilter(@Query() query: TransactionFilterDto) {
    return this.adminTransactionService.findFilter(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminTransactionService.findOne(id);
  }

  @Patch(':id')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionStatusDto,
  ) {
    return this.adminTransactionService.updateStatus(id, dto);
  }
}

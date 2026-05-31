import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CustomerTransactionService } from './customer-transaction.service';
import { CreateBookingDto } from './dto/booking.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/interfaces/jwt-payload.interface';
import { SWAGGER_BEARER_AUTH } from '../common/swagger/swagger.constants';

@ApiTags('Customers - Transactions')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('customers/transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
export class CustomerTransactionController {
  constructor(
    private readonly customerTransactionService: CustomerTransactionService,
  ) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBookingDto) {
    return this.customerTransactionService.createBooking(user.id, dto);
  }

  @Get('me')
  findMine(@CurrentUser() user: AuthUser, @Query() query: PaginationQueryDto) {
    return this.customerTransactionService.findMyTransactions(user.id, query);
  }

  @Get('me/:id')
  findMyDetail(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.customerTransactionService.findMyTransactionById(user.id, id);
  }
}

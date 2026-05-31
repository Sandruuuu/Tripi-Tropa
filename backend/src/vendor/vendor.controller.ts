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
import { VendorEmployeeService } from '../admin/vendor-employee.service';
import { TransportationService } from '../admin/transportation.service';
import { ScheduleService } from '../admin/schedule.service';
import { CarriageService } from '../admin/carriage.service';
import { SeatService } from '../admin/seat.service';
import {
  CreateTransportationDto,
  TransportationFilterDto,
  UpdateTransportationDto,
} from '../admin/dto/transportation.dto';
import {
  CreateScheduleDto,
  ScheduleFilterDto,
  UpdateScheduleDto,
} from '../admin/dto/schedule.dto';
import {
  CarriageFilterDto,
  CreateCarriageDto,
  UpdateCarriageDto,
} from '../admin/dto/carriage.dto';
import { CreateSeatDto, SeatFilterDto, UpdateSeatDto } from '../admin/dto/seat.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('Vendors')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
export class VendorController {
  constructor(
    private readonly vendorEmployeeService: VendorEmployeeService,
    private readonly transportationService: TransportationService,
    private readonly scheduleService: ScheduleService,
    private readonly carriageService: CarriageService,
    private readonly seatService: SeatService,
  ) {}

  @Get('me')
  findMe(@CurrentUser() user: AuthUser) {
    return this.vendorEmployeeService.findOne(user.id);
  }

  @Post('transportations')
  createTransportation(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTransportationDto,
  ) {
    return this.transportationService.create({
      ...dto,
      type: user.transportType!,
      vendorId: user.id,
    });
  }

  @Get('transportations')
  findTransportations(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.transportationService.findAll(query, user.transportType);
  }

  @Get('transportations/filter')
  filterTransportations(
    @CurrentUser() user: AuthUser,
    @Query() query: TransportationFilterDto,
  ) {
    return this.transportationService.findFilter(query, user.transportType);
  }

  @Get('transportations/:id')
  findTransportation(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.transportationService.findOne(id, user.transportType);
  }

  @Patch('transportations/:id')
  updateTransportation(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransportationDto,
  ) {
    return this.transportationService.update(id, dto, user.transportType);
  }

  @Delete('transportations/:id')
  removeTransportation(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.transportationService.remove(id, user.transportType);
  }

  @Post('schedules')
  createSchedule(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.scheduleService.create(dto, user.transportType);
  }

  @Get('schedules')
  findSchedules(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.scheduleService.findAll(query, user.transportType);
  }

  @Get('schedules/filter')
  filterSchedules(
    @CurrentUser() user: AuthUser,
    @Query() query: ScheduleFilterDto,
  ) {
    return this.scheduleService.findFilter(query, user.transportType);
  }

  @Get('schedules/:id')
  findSchedule(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.scheduleService.findOne(id, user.transportType);
  }

  @Patch('schedules/:id')
  updateSchedule(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(id, dto, user.transportType);
  }

  @Delete('schedules/:id')
  removeSchedule(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.scheduleService.remove(id, user.transportType);
  }

  @Post('carriages')
  createCarriage(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCarriageDto,
  ) {
    return this.carriageService.create(dto, user.transportType);
  }

  @Get('carriages')
  findCarriages(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.carriageService.findAll(query, user.transportType);
  }

  @Get('carriages/filter')
  filterCarriages(
    @CurrentUser() user: AuthUser,
    @Query() query: CarriageFilterDto,
  ) {
    return this.carriageService.findFilter(query, user.transportType);
  }

  @Get('carriages/:id')
  findCarriage(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.carriageService.findOne(id, user.transportType);
  }

  @Patch('carriages/:id')
  updateCarriage(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCarriageDto,
  ) {
    return this.carriageService.update(id, dto, user.transportType);
  }

  @Delete('carriages/:id')
  removeCarriage(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.carriageService.remove(id, user.transportType);
  }

  @Post('seats')
  createSeat(@CurrentUser() user: AuthUser, @Body() dto: CreateSeatDto) {
    return this.seatService.create(dto, user.transportType);
  }

  @Get('seats')
  findSeats(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.seatService.findAll(query, user.transportType);
  }

  @Get('seats/filter')
  filterSeats(
    @CurrentUser() user: AuthUser,
    @Query() query: SeatFilterDto,
  ) {
    return this.seatService.findFilter(query, user.transportType);
  }

  @Get('seats/:id')
  findSeat(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.seatService.findOne(id, user.transportType);
  }

  @Patch('seats/:id')
  updateSeat(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSeatDto,
  ) {
    return this.seatService.update(id, dto, user.transportType);
  }

  @Delete('seats/:id')
  removeSeat(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.seatService.remove(id, user.transportType);
  }
}

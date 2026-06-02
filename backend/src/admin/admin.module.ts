import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminVendorEmployeeController } from './admin-vendor-employee.controller';
import { VendorEmployeeService } from './vendor-employee.service';
import { AdminTransportationController } from './admin-transportation.controller';
import { TransportationService } from './transportation.service';
import { AdminScheduleController } from './admin-schedule.controller';
import { ScheduleService } from './schedule.service';
import { AdminCarriageController } from './admin-carriage.controller';
import { CarriageService } from './carriage.service';
import { AdminSeatController } from './admin-seat.controller';
import { SeatService } from './seat.service';
import { AdminTransactionController } from './admin-transaction.controller';
import { AdminTransactionService } from './admin-transaction.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  // AdminController (:id) harus terakhir agar tidak menangkap /admins/customers, dll.
  controllers: [
    AdminVendorEmployeeController,
    AdminTransportationController,
    AdminScheduleController,
    AdminCarriageController,
    AdminSeatController,
    AdminTransactionController,
    AdminController,
  ],
  providers: [
    AdminService,
    VendorEmployeeService,
    TransportationService,
    ScheduleService,
    CarriageService,
    SeatService,
    AdminTransactionService,
  ],
  exports: [
    TransportationService,
    ScheduleService,
    CarriageService,
    SeatService,
    VendorEmployeeService,
  ],
})
export class AdminModule {}

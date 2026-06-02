import { Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorTransportationController } from './vendor-transportation.controller';
import { VendorScheduleController } from './vendor-schedule.controller';
import { VendorCarriageController } from './vendor-carriage.controller';
import { VendorSeatController } from './vendor-seat.controller';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [AdminModule],
  controllers: [
    VendorController,
    VendorTransportationController,
    VendorScheduleController,
    VendorCarriageController,
    VendorSeatController,
  ],
})
export class VendorModule {}

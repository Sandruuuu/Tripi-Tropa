import { Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [AdminModule],
  controllers: [VendorController],
})
export class VendorModule {}

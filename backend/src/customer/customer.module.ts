import { Module } from '@nestjs/common';
import { CustomerController, AdminCustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { CustomerTransactionController } from './customer-transaction.controller';
import { CustomerTransactionService } from './customer-transaction.service';
import { PaymentModule } from '../payment/payment.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, PaymentModule],
  controllers: [
    CustomerController,
    AdminCustomerController,
    CatalogController,
    CustomerTransactionController,
  ],
  providers: [CustomerService, CatalogService, CustomerTransactionService],
  exports: [CustomerService],
})
export class CustomerModule {}

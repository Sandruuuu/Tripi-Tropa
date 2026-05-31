import { IsEnum, IsOptional } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class UpdateTransactionStatusDto {
  @IsEnum(TransactionStatus)
  status: TransactionStatus;
}

export class TransactionFilterDto {
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  search?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  quantity?: number;
}

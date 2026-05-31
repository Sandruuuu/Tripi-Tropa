import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TransportType } from '@prisma/client';

export class CreateTransportationDto {
  @IsEnum(TransportType)
  type: TransportType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsInt()
  vendorId?: number;
}

export class UpdateTransportationDto {
  @IsOptional()
  @IsEnum(TransportType)
  type?: TransportType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsInt()
  vendorId?: number;
}

export class TransportationFilterDto {
  @IsOptional()
  @IsEnum(TransportType)
  type?: TransportType;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsInt()
  quantity?: number;
}

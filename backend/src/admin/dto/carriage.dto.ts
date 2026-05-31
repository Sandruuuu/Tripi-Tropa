import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ClassType } from '@prisma/client';

export class CreateCarriageDto {
  @IsInt()
  scheduleId: number;

  @IsString()
  @IsNotEmpty()
  carriageNumber: string;

  @IsEnum(ClassType)
  classType: ClassType;

  @IsInt()
  @Min(1)
  totalSeats: number;
}

export class UpdateCarriageDto {
  @IsOptional()
  @IsInt()
  scheduleId?: number;

  @IsOptional()
  @IsString()
  carriageNumber?: string;

  @IsOptional()
  @IsEnum(ClassType)
  classType?: ClassType;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalSeats?: number;
}

export class CarriageFilterDto {
  @IsOptional()
  @IsInt()
  scheduleId?: number;

  @IsOptional()
  @IsEnum(ClassType)
  classType?: ClassType;

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

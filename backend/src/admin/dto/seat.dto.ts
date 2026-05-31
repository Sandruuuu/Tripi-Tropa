import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSeatDto {
  @IsInt()
  carriageId: number;

  @IsString()
  @IsNotEmpty()
  seatNumber: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class UpdateSeatDto {
  @IsOptional()
  @IsInt()
  carriageId?: number;

  @IsOptional()
  @IsString()
  seatNumber?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class SeatFilterDto {
  @IsOptional()
  @IsInt()
  carriageId?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

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

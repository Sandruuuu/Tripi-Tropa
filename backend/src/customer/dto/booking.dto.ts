import { IsArray, ArrayMinSize, IsInt } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  schedule_id: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  seat_ids: number[];
}

import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransportType } from '@prisma/client';
import { CatalogService } from './catalog.service';
import { ScheduleFilterDto } from '../admin/dto/schedule.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Customers - Catalog')
@Controller('customers/schedules')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Public()
  @Get()
  findAll(
    @Query() query: ScheduleFilterDto & { type?: TransportType },
  ) {
    return this.catalogService.findSchedules(query);
  }

  @Public()
  @Get('filter')
  findFilter(@Query() query: ScheduleFilterDto) {
    return this.catalogService.filterSchedules(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.findScheduleById(id);
  }
}

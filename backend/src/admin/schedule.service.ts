import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransportType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateScheduleDto,
  ScheduleFilterDto,
  UpdateScheduleDto,
} from './dto/schedule.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  buildSearchFilter,
  getPagination,
} from '../common/utils/pagination.util';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateScheduleDto, transportType?: TransportType) {
    await this.ensureTransport(dto.transportId, transportType);

    const schedule = await this.prisma.schedule.create({
      data: {
        transportId: dto.transportId,
        origin: dto.origin,
        destination: dto.destination,
        departureTime: new Date(dto.departureTime),
        price: dto.price,
      },
      include: this.includeRelations(),
    });

    return { message: 'Jadwal berhasil dibuat', data: schedule };
  }

  async findAll(query: PaginationQueryDto, transportType?: TransportType) {
    const { skip, take, page, quantity } = getPagination(
      query.page,
      query.quantity,
    );
    const where = this.buildWhere(query, transportType);

    const [items, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where,
        skip,
        take,
        include: this.includeRelations(),
        orderBy: { departureTime: 'asc' },
      }),
      this.prisma.schedule.count({ where }),
    ]);

    return {
      message: 'Daftar jadwal berhasil diambil',
      data: { items, page, quantity, total },
    };
  }

  async findOne(id: number, transportType?: TransportType) {
    const schedule = await this.prisma.schedule.findFirst({
      where: {
        id,
        ...(transportType
          ? { transport: { type: transportType } }
          : {}),
      },
      include: this.includeRelations(),
    });
    if (!schedule) {
      throw new NotFoundException('Jadwal tidak ditemukan');
    }
    return { message: 'Detail jadwal berhasil diambil', data: schedule };
  }

  async findFilter(query: ScheduleFilterDto, transportType?: TransportType) {
    const { skip, take } = getPagination(query.page, query.quantity);
    const where = this.buildWhere(query, transportType);

    const data = await this.prisma.schedule.findMany({
      where,
      skip,
      take,
      include: this.includeRelations(),
      orderBy: { departureTime: 'asc' },
    });

    return { message: 'Filter jadwal berhasil diambil', data };
  }

  async update(id: number, dto: UpdateScheduleDto, transportType?: TransportType) {
    await this.findOne(id, transportType);
    if (dto.transportId) {
      await this.ensureTransport(dto.transportId, transportType);
    }

    const schedule = await this.prisma.schedule.update({
      where: { id },
      data: {
        transportId: dto.transportId,
        origin: dto.origin,
        destination: dto.destination,
        departureTime: dto.departureTime
          ? new Date(dto.departureTime)
          : undefined,
        price: dto.price,
        status: dto.status,
      },
      include: this.includeRelations(),
    });

    return { message: 'Jadwal berhasil diupdate', data: schedule };
  }

  async remove(id: number, transportType?: TransportType) {
    await this.findOne(id, transportType);
    await this.prisma.schedule.delete({ where: { id } });
    return { message: 'Jadwal berhasil dihapus', data: { id } };
  }

  private async ensureTransport(transportId: number, transportType?: TransportType) {
    const transport = await this.prisma.transportation.findFirst({
      where: {
        id: transportId,
        ...(transportType ? { type: transportType } : {}),
      },
    });
    if (!transport) {
      throw new NotFoundException('Armada tidak ditemukan');
    }
  }

  private buildWhere(
    query: PaginationQueryDto | ScheduleFilterDto,
    transportType?: TransportType,
  ): Prisma.ScheduleWhereInput {
    const scheduleQuery = query as ScheduleFilterDto;
    return {
      ...(transportType
        ? { transport: { type: transportType } }
        : {}),
      ...(scheduleQuery.origin
        ? { origin: { contains: scheduleQuery.origin, mode: 'insensitive' } }
        : {}),
      ...(scheduleQuery.destination
        ? {
            destination: {
              contains: scheduleQuery.destination,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(scheduleQuery.status ? { status: scheduleQuery.status } : {}),
      ...(scheduleQuery.transportId
        ? { transportId: scheduleQuery.transportId }
        : {}),
      ...(buildSearchFilter(query.search, ['origin', 'destination']) || {}),
    };
  }

  private includeRelations() {
    return {
      transport: {
        select: { id: true, name: true, code: true, type: true, capacity: true },
      },
      carriages: {
        select: {
          id: true,
          carriageNumber: true,
          classType: true,
          totalSeats: true,
        },
      },
    };
  }
}

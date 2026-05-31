import { Injectable, NotFoundException } from '@nestjs/common';
import { ScheduleStatus, TransportType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleFilterDto } from '../admin/dto/schedule.dto';
import {
  buildSearchFilter,
  getPagination,
} from '../common/utils/pagination.util';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async findSchedules(query: ScheduleFilterDto & { type?: TransportType }) {
    const { skip, take, page, quantity } = getPagination(
      query.page,
      query.quantity,
    );

    const where = {
      status: ScheduleStatus.ACTIVE,
      ...(query.type ? { transport: { type: query.type } } : {}),
      ...(query.origin
        ? { origin: { contains: query.origin, mode: 'insensitive' as const } }
        : {}),
      ...(query.destination
        ? {
            destination: {
              contains: query.destination,
              mode: 'insensitive' as const,
            },
          }
        : {}),
      ...(buildSearchFilter(query.search, ['origin', 'destination']) || {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where,
        skip,
        take,
        include: {
          transport: {
            select: { id: true, name: true, code: true, type: true },
          },
          carriages: {
            select: {
              id: true,
              carriageNumber: true,
              classType: true,
              seats: {
                where: { isAvailable: true },
                select: { id: true, seatNumber: true, isAvailable: true },
              },
            },
          },
        },
        orderBy: { departureTime: 'asc' },
      }),
      this.prisma.schedule.count({ where }),
    ]);

    return {
      message: 'Katalog jadwal berhasil diambil',
      data: { items, page, quantity, total },
    };
  }

  async findScheduleById(id: number) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, status: ScheduleStatus.ACTIVE },
      include: {
        transport: {
          select: { id: true, name: true, code: true, type: true },
        },
        carriages: {
          include: {
            seats: {
              select: { id: true, seatNumber: true, isAvailable: true },
            },
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Jadwal tidak ditemukan');
    }

    return {
      message: 'Detail jadwal katalog berhasil diambil',
      data: schedule,
    };
  }

  async filterSchedules(query: ScheduleFilterDto) {
    const { skip, take } = getPagination(query.page, query.quantity);
    const data = await this.prisma.schedule.findMany({
      where: {
        status: ScheduleStatus.ACTIVE,
        ...(query.transportId ? { transportId: query.transportId } : {}),
        ...(query.origin
          ? { origin: { contains: query.origin, mode: 'insensitive' } }
          : {}),
        ...(query.destination
          ? { destination: { contains: query.destination, mode: 'insensitive' } }
          : {}),
        ...(buildSearchFilter(query.search, ['origin', 'destination']) || {}),
      },
      skip,
      take,
      include: {
        transport: { select: { id: true, name: true, type: true, code: true } },
      },
    });

    return { message: 'Filter katalog jadwal berhasil diambil', data };
  }
}

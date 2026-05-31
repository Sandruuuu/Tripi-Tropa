import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClassType, Prisma, TransportType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CarriageFilterDto,
  CreateCarriageDto,
  UpdateCarriageDto,
} from './dto/carriage.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  buildSearchFilter,
  getPagination,
} from '../common/utils/pagination.util';

@Injectable()
export class CarriageService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCarriageDto, transportType?: TransportType) {
    await this.ensureSchedule(dto.scheduleId, transportType);

    try {
      const carriage = await this.prisma.carriage.create({
        data: dto,
        include: this.includeRelations(),
      });
      return { message: 'Gerbong berhasil dibuat', data: carriage };
    } catch {
      throw new ConflictException('Nomor gerbong sudah ada di jadwal ini');
    }
  }

  async findAll(query: PaginationQueryDto, transportType?: TransportType) {
    const { skip, take, page, quantity } = getPagination(
      query.page,
      query.quantity,
    );
    const where = this.buildWhere(query, transportType);

    const [items, total] = await Promise.all([
      this.prisma.carriage.findMany({
        where,
        skip,
        take,
        include: this.includeRelations(),
        orderBy: { id: 'asc' },
      }),
      this.prisma.carriage.count({ where }),
    ]);

    return {
      message: 'Daftar gerbong berhasil diambil',
      data: { items, page, quantity, total },
    };
  }

  async findOne(id: number, transportType?: TransportType) {
    const carriage = await this.prisma.carriage.findFirst({
      where: {
        id,
        ...(transportType
          ? { schedule: { transport: { type: transportType } } }
          : {}),
      },
      include: this.includeRelations(),
    });
    if (!carriage) {
      throw new NotFoundException('Gerbong tidak ditemukan');
    }
    return { message: 'Detail gerbong berhasil diambil', data: carriage };
  }

  async findFilter(query: CarriageFilterDto, transportType?: TransportType) {
    const { skip, take } = getPagination(query.page, query.quantity);
    const where = this.buildWhere(query, transportType);

    const data = await this.prisma.carriage.findMany({
      where,
      skip,
      take,
      include: this.includeRelations(),
    });

    return { message: 'Filter gerbong berhasil diambil', data };
  }

  async update(id: number, dto: UpdateCarriageDto, transportType?: TransportType) {
    await this.findOne(id, transportType);
    if (dto.scheduleId) {
      await this.ensureSchedule(dto.scheduleId, transportType);
    }

    const carriage = await this.prisma.carriage.update({
      where: { id },
      data: dto,
      include: this.includeRelations(),
    });

    return { message: 'Gerbong berhasil diupdate', data: carriage };
  }

  async remove(id: number, transportType?: TransportType) {
    await this.findOne(id, transportType);
    await this.prisma.carriage.delete({ where: { id } });
    return { message: 'Gerbong berhasil dihapus', data: { id } };
  }

  private async ensureSchedule(scheduleId: number, transportType?: TransportType) {
    const schedule = await this.prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        ...(transportType
          ? { transport: { type: transportType } }
          : {}),
      },
    });
    if (!schedule) {
      throw new NotFoundException('Jadwal tidak ditemukan');
    }
  }

  private buildWhere(
    query: PaginationQueryDto | CarriageFilterDto,
    transportType?: TransportType,
  ): Prisma.CarriageWhereInput {
    const carriageQuery = query as CarriageFilterDto;
    return {
      ...(transportType
        ? { schedule: { transport: { type: transportType } } }
        : {}),
      ...(carriageQuery.scheduleId
        ? { scheduleId: carriageQuery.scheduleId }
        : {}),
      ...(carriageQuery.classType
        ? { classType: carriageQuery.classType as ClassType }
        : {}),
      ...(buildSearchFilter(query.search, ['carriageNumber']) || {}),
    };
  }

  private includeRelations() {
    return {
      schedule: {
        select: {
          id: true,
          origin: true,
          destination: true,
          departureTime: true,
          transport: { select: { id: true, type: true, name: true } },
        },
      },
      seats: { select: { id: true, seatNumber: true, isAvailable: true } },
    };
  }
}

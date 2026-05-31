import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransportType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeatDto, SeatFilterDto, UpdateSeatDto } from './dto/seat.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  buildSearchFilter,
  getPagination,
} from '../common/utils/pagination.util';

@Injectable()
export class SeatService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSeatDto, transportType?: TransportType) {
    await this.ensureCarriage(dto.carriageId, transportType);

    try {
      const seat = await this.prisma.seat.create({
        data: dto,
        include: this.includeRelations(),
      });
      return { message: 'Kursi berhasil dibuat', data: seat };
    } catch {
      throw new ConflictException('Nomor kursi sudah ada di gerbong ini');
    }
  }

  async findAll(query: PaginationQueryDto, transportType?: TransportType) {
    const { skip, take, page, quantity } = getPagination(
      query.page,
      query.quantity,
    );
    const where = this.buildWhere(query, transportType);

    const [items, total] = await Promise.all([
      this.prisma.seat.findMany({
        where,
        skip,
        take,
        include: this.includeRelations(),
        orderBy: { id: 'asc' },
      }),
      this.prisma.seat.count({ where }),
    ]);

    return {
      message: 'Daftar kursi berhasil diambil',
      data: { items, page, quantity, total },
    };
  }

  async findOne(id: number, transportType?: TransportType) {
    const seat = await this.prisma.seat.findFirst({
      where: {
        id,
        ...(transportType
          ? {
              carriage: {
                schedule: { transport: { type: transportType } },
              },
            }
          : {}),
      },
      include: this.includeRelations(),
    });
    if (!seat) {
      throw new NotFoundException('Kursi tidak ditemukan');
    }
    return { message: 'Detail kursi berhasil diambil', data: seat };
  }

  async findFilter(query: SeatFilterDto, transportType?: TransportType) {
    const { skip, take } = getPagination(query.page, query.quantity);
    const where = this.buildWhere(query, transportType);

    const data = await this.prisma.seat.findMany({
      where,
      skip,
      take,
      include: this.includeRelations(),
    });

    return { message: 'Filter kursi berhasil diambil', data };
  }

  async update(id: number, dto: UpdateSeatDto, transportType?: TransportType) {
    await this.findOne(id, transportType);
    if (dto.carriageId) {
      await this.ensureCarriage(dto.carriageId, transportType);
    }

    const seat = await this.prisma.seat.update({
      where: { id },
      data: dto,
      include: this.includeRelations(),
    });

    return { message: 'Kursi berhasil diupdate', data: seat };
  }

  async remove(id: number, transportType?: TransportType) {
    await this.findOne(id, transportType);
    await this.prisma.seat.delete({ where: { id } });
    return { message: 'Kursi berhasil dihapus', data: { id } };
  }

  private async ensureCarriage(carriageId: number, transportType?: TransportType) {
    const carriage = await this.prisma.carriage.findFirst({
      where: {
        id: carriageId,
        ...(transportType
          ? { schedule: { transport: { type: transportType } } }
          : {}),
      },
    });
    if (!carriage) {
      throw new NotFoundException('Gerbong tidak ditemukan');
    }
  }

  private buildWhere(
    query: PaginationQueryDto | SeatFilterDto,
    transportType?: TransportType,
  ): Prisma.SeatWhereInput {
    const seatQuery = query as SeatFilterDto;
    return {
      ...(transportType
        ? {
            carriage: {
              schedule: { transport: { type: transportType } },
            },
          }
        : {}),
      ...(seatQuery.carriageId ? { carriageId: seatQuery.carriageId } : {}),
      ...(seatQuery.isAvailable !== undefined
        ? { isAvailable: seatQuery.isAvailable }
        : {}),
      ...(buildSearchFilter(query.search, ['seatNumber']) || {}),
    };
  }

  private includeRelations() {
    return {
      carriage: {
        select: {
          id: true,
          carriageNumber: true,
          classType: true,
          schedule: {
            select: {
              id: true,
              origin: true,
              destination: true,
              transport: { select: { id: true, type: true, name: true } },
            },
          },
        },
      },
    };
  }
}

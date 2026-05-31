import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransportType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTransportationDto,
  TransportationFilterDto,
  UpdateTransportationDto,
} from './dto/transportation.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  buildSearchFilter,
  getPagination,
} from '../common/utils/pagination.util';

@Injectable()
export class TransportationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTransportationDto) {
    const exists = await this.prisma.transportation.findUnique({
      where: { code: dto.code },
    });
    if (exists) {
      throw new ConflictException('Kode armada sudah digunakan');
    }

    const transportation = await this.prisma.transportation.create({
      data: dto,
      include: { vendor: { select: { id: true, name: true, transportType: true } } },
    });

    return { message: 'Armada berhasil dibuat', data: transportation };
  }

  async findAll(query: PaginationQueryDto, transportType?: TransportType) {
    const { skip, take, page, quantity } = getPagination(
      query.page,
      query.quantity,
    );
    const where: Prisma.TransportationWhereInput = {
      ...(transportType ? { type: transportType } : {}),
      ...(buildSearchFilter(query.search, ['name', 'code']) || {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.transportation.findMany({
        where,
        skip,
        take,
        include: { vendor: { select: { id: true, name: true, transportType: true } } },
        orderBy: { id: 'asc' },
      }),
      this.prisma.transportation.count({ where }),
    ]);

    return {
      message: 'Daftar armada berhasil diambil',
      data: { items, page, quantity, total },
    };
  }

  async findOne(id: number, transportType?: TransportType) {
    const transportation = await this.prisma.transportation.findFirst({
      where: { id, ...(transportType ? { type: transportType } : {}) },
      include: { vendor: { select: { id: true, name: true, transportType: true } } },
    });
    if (!transportation) {
      throw new NotFoundException('Armada tidak ditemukan');
    }
    return { message: 'Detail armada berhasil diambil', data: transportation };
  }

  async findFilter(query: TransportationFilterDto, transportType?: TransportType) {
    const { skip, take } = getPagination(query.page, query.quantity);
    const where: Prisma.TransportationWhereInput = {
      ...(transportType ? { type: transportType } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(buildSearchFilter(query.search, ['name', 'code']) || {}),
    };

    const data = await this.prisma.transportation.findMany({
      where,
      skip,
      take,
      include: { vendor: { select: { id: true, name: true, transportType: true } } },
    });

    return { message: 'Filter armada berhasil diambil', data };
  }

  async update(id: number, dto: UpdateTransportationDto, transportType?: TransportType) {
    await this.findOne(id, transportType);
    const transportation = await this.prisma.transportation.update({
      where: { id },
      data: dto,
      include: { vendor: { select: { id: true, name: true, transportType: true } } },
    });
    return { message: 'Armada berhasil diupdate', data: transportation };
  }

  async remove(id: number, transportType?: TransportType) {
    await this.findOne(id, transportType);
    await this.prisma.transportation.delete({ where: { id } });
    return { message: 'Armada berhasil dihapus', data: { id } };
  }
}

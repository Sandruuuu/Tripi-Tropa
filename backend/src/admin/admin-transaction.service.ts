import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  TransactionFilterDto,
  UpdateTransactionStatusDto,
} from './dto/transaction.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  buildSearchFilter,
  getPagination,
} from '../common/utils/pagination.util';

@Injectable()
export class AdminTransactionService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { skip, take, page, quantity } = getPagination(
      query.page,
      query.quantity,
    );
    const where = buildSearchFilter(query.search, ['externalOrderId']);

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take,
        include: this.includeRelations(),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      message: 'Daftar transaksi berhasil diambil',
      data: { items, page, quantity, total },
    };
  }

  async findOne(id: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: this.includeRelations(),
    });
    if (!transaction) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }
    return { message: 'Detail transaksi berhasil diambil', data: transaction };
  }

  async findFilter(query: TransactionFilterDto) {
    const { skip, take } = getPagination(query.page, query.quantity);
    const where: Prisma.TransactionWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(buildSearchFilter(query.search, ['externalOrderId']) || {}),
    };

    const data = await this.prisma.transaction.findMany({
      where,
      skip,
      take,
      include: this.includeRelations(),
      orderBy: { createdAt: 'desc' },
    });

    return { message: 'Filter transaksi berhasil diambil', data };
  }

  async updateStatus(id: number, dto: UpdateTransactionStatusDto) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { bookingSeats: true },
    });
    if (!transaction) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }

    if (
      transaction.status === TransactionStatus.SUCCESS &&
      dto.status !== TransactionStatus.SUCCESS
    ) {
      throw new BadRequestException(
        'Transaksi sukses tidak dapat diubah ke status lain',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.transaction.update({
        where: { id },
        data: { status: dto.status },
        include: this.includeRelations(),
      });

      if (dto.status === TransactionStatus.SUCCESS) {
        await tx.seat.updateMany({
          where: {
            id: {
              in: transaction.bookingSeats.map((item) => item.seatId),
            },
          },
          data: { isAvailable: false },
        });
      }

      if (dto.status === TransactionStatus.FAILED) {
        await tx.seat.updateMany({
          where: {
            id: {
              in: transaction.bookingSeats.map((item) => item.seatId),
            },
          },
          data: { isAvailable: true },
        });
      }

      return result;
    });

    return { message: 'Status transaksi berhasil diupdate', data: updated };
  }

  private includeRelations() {
    return {
      customer: {
        select: {
          id: true,
          username: true,
          name: true,
          customer_number: true,
        },
      },
      schedule: {
        include: {
          transport: {
            select: { id: true, name: true, type: true, code: true },
          },
        },
      },
      bookingSeats: {
        include: {
          seat: {
            select: {
              id: true,
              seatNumber: true,
              carriage: {
                select: { id: true, carriageNumber: true, classType: true },
              },
            },
          },
        },
      },
    };
  }
}

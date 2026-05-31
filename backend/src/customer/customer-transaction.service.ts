import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ScheduleStatus, TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/booking.dto';
import { PaymentService } from '../payment/payment.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { getPagination } from '../common/utils/pagination.util';

@Injectable()
export class CustomerTransactionService {
  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService,
  ) {}

  async createBooking(customerId: number, dto: CreateBookingDto) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id: dto.schedule_id, status: ScheduleStatus.ACTIVE },
    });
    if (!schedule) {
      throw new NotFoundException('Jadwal tidak ditemukan atau tidak aktif');
    }

    const seats = await this.prisma.seat.findMany({
      where: {
        id: { in: dto.seat_ids },
        isAvailable: true,
        carriage: { scheduleId: dto.schedule_id },
      },
    });

    if (seats.length !== dto.seat_ids.length) {
      throw new BadRequestException('Salah satu kursi tidak tersedia');
    }

    const totalAmount = Number(schedule.price) * dto.seat_ids.length;
    const externalOrderId = `TRP-${Date.now()}-${customerId}`;

    const transaction = await this.prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          customerId,
          scheduleId: dto.schedule_id,
          status: TransactionStatus.PENDING,
          externalOrderId,
          totalAmount,
          bookingSeats: {
            create: dto.seat_ids.map((seatId) => ({ seatId })),
          },
        },
        include: {
          schedule: {
            include: { transport: true },
          },
          bookingSeats: {
            include: { seat: true },
          },
        },
      });

      await tx.seat.updateMany({
        where: { id: { in: dto.seat_ids } },
        data: { isAvailable: false },
      });

      return created;
    });

    const paymentUrl = this.paymentService.buildMockPaymentUrl(transaction.id);

    const updated = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { paymentUrl },
      include: {
        schedule: { include: { transport: true } },
        bookingSeats: { include: { seat: true } },
      },
    });

    return {
      message: 'Transaksi pemesanan tiket berhasil dibuat',
      data: {
        transactionId: updated.id,
        payment_url: paymentUrl,
        transaction: updated,
      },
    };
  }

  async findMyTransactions(customerId: number, query: PaginationQueryDto) {
    const { skip, take, page, quantity } = getPagination(
      query.page,
      query.quantity,
    );

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { customerId },
        skip,
        take,
        include: {
          schedule: {
            include: { transport: true },
          },
          bookingSeats: {
            include: {
              seat: {
                include: {
                  carriage: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where: { customerId } }),
    ]);

    return {
      message: 'Riwayat transaksi berhasil diambil',
      data: { items, page, quantity, total },
    };
  }

  async findMyTransactionById(customerId: number, id: number) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, customerId },
      include: {
        schedule: { include: { transport: true } },
        bookingSeats: { include: { seat: { include: { carriage: true } } } },
      },
    });
    if (!transaction) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }
    return { message: 'Detail transaksi berhasil diambil', data: transaction };
  }
}

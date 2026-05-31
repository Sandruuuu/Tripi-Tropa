import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  buildMockPaymentUrl(transactionId: number): string {
    const baseUrl =
      process.env.MOCK_PAYMENT_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/payments/mock/${transactionId}`;
  }

  async getMockCheckout(transactionId: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        customer: { select: { id: true, name: true, username: true } },
        schedule: {
          include: { transport: true },
        },
        bookingSeats: { include: { seat: true } },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }

    return {
      message: 'Halaman mock checkout berhasil diambil',
      data: {
        transactionId: transaction.id,
        status: transaction.status,
        totalAmount: transaction.totalAmount,
        paymentUrl: transaction.paymentUrl,
        instruction:
          'Gunakan POST /payments/mock/:transactionId/pay untuk simulasi pembayaran sukses',
        transaction,
      },
    };
  }

  async simulatePayment(transactionId: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { bookingSeats: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }

    if (transaction.status === TransactionStatus.SUCCESS) {
      throw new BadRequestException('Transaksi sudah dibayar');
    }

    return this.handleWebhook({
      order_id: transaction.externalOrderId,
      transaction_status: 'success',
    });
  }

  async handleWebhook(payload: {
    order_id?: string | null;
    transaction_status: 'success' | 'failed' | 'pending';
  }) {
    if (!payload.order_id) {
      throw new BadRequestException('order_id wajib diisi');
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { externalOrderId: payload.order_id },
      include: { bookingSeats: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaksi webhook tidak ditemukan');
    }

    if (transaction.status === TransactionStatus.SUCCESS) {
      return {
        message: 'Transaksi sudah sukses sebelumnya',
        data: transaction,
      };
    }

    const nextStatus =
      payload.transaction_status === 'success'
        ? TransactionStatus.SUCCESS
        : payload.transaction_status === 'failed'
          ? TransactionStatus.FAILED
          : TransactionStatus.PENDING;

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: nextStatus },
        include: {
          customer: { select: { id: true, name: true, username: true } },
          schedule: { include: { transport: true } },
          bookingSeats: { include: { seat: true } },
        },
      });

      if (nextStatus === TransactionStatus.FAILED) {
        await tx.seat.updateMany({
          where: {
            id: { in: transaction.bookingSeats.map((item) => item.seatId) },
          },
          data: { isAvailable: true },
        });
      }

      if (nextStatus === TransactionStatus.SUCCESS) {
        await tx.seat.updateMany({
          where: {
            id: { in: transaction.bookingSeats.map((item) => item.seatId) },
          },
          data: { isAvailable: false },
        });
      }

      return result;
    });

    return {
      message:
        nextStatus === TransactionStatus.SUCCESS
          ? 'Pembayaran berhasil dikonfirmasi'
          : nextStatus === TransactionStatus.FAILED
            ? 'Pembayaran gagal'
            : 'Status pembayaran masih pending',
      data: updated,
    };
  }
}

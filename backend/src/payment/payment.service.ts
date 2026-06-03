import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
// @ts-ignore
import * as midtransClient from 'midtrans-client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  private getSnapInstance() {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

    if (!serverKey) {
      return null;
    }

    return new midtransClient.Snap({
      isProduction,
      serverKey,
      clientKey,
    });
  }

  async createMidtransTransaction(transaction: any) {
    const snap = this.getSnapInstance();
    if (!snap) {
      return null;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const parameter = {
      transaction_details: {
        order_id: transaction.externalOrderId,
        gross_amount: Math.round(Number(transaction.totalAmount)),
      },
      customer_details: {
        first_name: transaction.customer?.name || 'Customer',
        email: transaction.customer?.username ? `${transaction.customer.username}@mail.com` : undefined,
        phone: transaction.customer?.phone || '',
      },
      callbacks: {
        finish: `${frontendUrl}/customer/transactions`,
        unfinish: `${frontendUrl}/customer/transactions`,
        error: `${frontendUrl}/customer/transactions`,
      },
    };

    try {
      const response = await snap.createTransaction(parameter);
      return {
        token: response.token,
        redirect_url: response.redirect_url,
      };
    } catch (error) {
      console.error('Midtrans createTransaction error:', error);
      return null;
    }
  }

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

  async handleWebhook(payload: any) {
    const order_id = payload.order_id;
    if (!order_id) {
      throw new BadRequestException('order_id wajib diisi');
    }

    // Validasi signature key dari Midtrans jika Server Key dikonfigurasi dan dikirim oleh payload
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (serverKey && payload.signature_key) {
      const { status_code, gross_amount, signature_key } = payload;
      const crypto = require('crypto');
      const hash = crypto
        .createHash('sha512')
        .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
        .digest('hex');

      if (hash !== signature_key) {
        throw new BadRequestException('Signature key tidak valid');
      }
    }

    // Mapping status pembayaran Midtrans / Mock
    let statusMapped: 'success' | 'failed' | 'pending' = 'pending';
    const midtransStatus = payload.transaction_status;

    if (midtransStatus === 'success' || midtransStatus === 'failed' || midtransStatus === 'pending') {
      statusMapped = midtransStatus;
    } else if (midtransStatus) {
      if (midtransStatus === 'capture') {
        if (payload.fraud_status === 'accept') {
          statusMapped = 'success';
        } else {
          statusMapped = 'failed';
        }
      } else if (midtransStatus === 'settlement') {
        statusMapped = 'success';
      } else if (
        midtransStatus === 'cancel' ||
        midtransStatus === 'deny' ||
        midtransStatus === 'expire'
      ) {
        statusMapped = 'failed';
      } else if (midtransStatus === 'pending') {
        statusMapped = 'pending';
      }
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { externalOrderId: order_id },
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
      statusMapped === 'success'
        ? TransactionStatus.SUCCESS
        : statusMapped === 'failed'
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

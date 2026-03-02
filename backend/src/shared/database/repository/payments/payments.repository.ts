import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../service/database.service';
import { BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly db: DatabaseService) {}

  findBooking(id: string) {
    return this.db.booking.findUnique({
      where: { id },
      include: {
        payment: true,
        parkingLot: { select: { id: true, ownerId: true } },
      },
    });
  }

  createPayment(data: {
    bookingId: string;
    method: PaymentMethod;
    amount: number;
    phone?: string | null;
  }) {
    return this.db.payment.create({
      data: {
        bookingId: data.bookingId,
        method: data.method,
        amount: data.amount,
        phone: data.phone ?? null,
        status: PaymentStatus.INITIATED,
      },
    });
  }

  findPayment(id: string) {
    return this.db.payment.findUnique({
      where: { id },
      include: { booking: true },
    });
  }

  async markSuccess(paymentId: string, providerRef?: string) {
    return this.db.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.SUCCESS,
          providerRef: providerRef ?? `SIM-${Date.now()}`,
        },
        include: { booking: true },
      });

      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: BookingStatus.CONFIRMED },
      });

      return payment;
    });
  }

  async markFailed(paymentId: string) {
    return this.db.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.FAILED },
      include: { booking: true },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../service/database.service';
import { BookingStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import type { Booking, Payment, ParkingLot, Prisma } from '@prisma/client';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly db: DatabaseService) {}
  findBooking(id: string) {
    return this.db.booking.findUnique({
      where: { id },
      include: {
        payment: true,
        parkingLot: {
          include: {
            pricingRules: {
              where: { isActive: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });
  }

  createPayment(data: {
    bookingId: string;
    method: PaymentMethod;
    amount: number;
    phone?: string | null;
    reference?: string;
    providerRequestId?: string | null;
    providerCheckoutId?: string | null;
    rawPayload?: Prisma.InputJsonValue;
  }) {
    return this.db.payment.create({
      data: {
        bookingId: data.bookingId,
        method: data.method,
        amount: data.amount,
        phone: data.phone ?? null,
        status: PaymentStatus.INITIATED,
        reference: data.reference ?? `INV-${Date.now()}`,
        providerRequestId: data.providerRequestId ?? null,
        providerCheckoutId: data.providerCheckoutId ?? null,
        rawPayload: data.rawPayload ?? undefined,
      },
    });
  }

  findPayment(id: string) {
    return this.db.payment.findUnique({
      where: { id },
      include: { booking: { include: { parkingLot: true } } },
    }) as Promise<
      (Payment & { booking: Booking & { parkingLot: ParkingLot } }) | null
    >;
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

  getPaymentById(id: string) {
    return this.db.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            parkingLot: {
              select: {
                id: true,
                name: true,
                ownerId: true,
                addressText: true,
              },
            },
            user: { select: { id: true, fullName: true, phone: true } },
          },
        },
      },
    }) as Promise<
      | (Payment & {
          booking: Booking & {
            parkingLot: {
              id: string;
              name: string;
              ownerId: string;
              addressText: string | null;
            };
            user: { id: string; fullName: string; phone: string };
          };
        })
      | null
    >;
  }

  listPayments(where: any, take = 50, skip = 0) {
    return this.db.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: {
        booking: {
          include: {
            parkingLot: { select: { id: true, name: true, ownerId: true } },
            user: { select: { id: true, fullName: true, phone: true } },
          },
        },
      },
    }) as Promise<
      (Payment & {
        booking: Booking & {
          parkingLot: { id: string; name: string; ownerId: string };
          user: { id: string; fullName: string; phone: string };
        };
      })[]
    >;
  }

  async updateByReference(reference: string, data: Prisma.PaymentUpdateInput) {
    return this.db.payment.update({
      where: { reference },
      data,
    });
  }
  async confirmBooking(reference: string) {
    const payment = await this.db.payment.findUnique({
      where: { reference },
    });

    if (!payment) throw new Error('Payment not found');

    return this.db.booking.update({
      where: { id: payment.bookingId },
      data: { status: BookingStatus.CONFIRMED },
    });
  }
  getPaymentByReference(reference: string) {
    return this.db.payment.findUnique({
      where: { reference },
      include: {
        booking: {
          include: {
            parkingLot: {
              select: {
                id: true,
                name: true,
                ownerId: true,
                addressText: true,
              },
            },
            user: {
              select: {
                id: true,
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }
  async getPaymentByCheckoutId(checkoutId: string) {
    return this.db.payment.findFirst({
      where: { providerCheckoutId: checkoutId },
      include: {
        booking: {
          include: {
            parkingLot: true,
          },
        },
      },
    });
  }
  async markPaymentResultByReference(
    reference: string,
    status: PaymentStatus,
    providerRef?: string | null,
    rawPayload?: Prisma.InputJsonValue,
  ) {
    return this.db.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { reference },
        data: {
          status,
          providerRef: providerRef ?? undefined,
          rawPayload,
        },
      });

      if (status === PaymentStatus.SUCCESS) {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: BookingStatus.CONFIRMED },
        });
      }

      return payment;
    });
  }

  async getPaymentByProviderRequestId(requestId: string) {
    return this.db.payment.findFirst({
      where: { providerRequestId: requestId },
      include: {
        booking: {
          include: {
            parkingLot: true,
          },
        },
      },
    });
  }
}

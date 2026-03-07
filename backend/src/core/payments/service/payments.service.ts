import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole, PaymentStatus, PaymentMethod } from '@prisma/client';
import { PaymentsRepository } from '../../../shared/database/repository/payments/payments.repository';
import { KcbBuniService } from '../providers/kcb-buni.service';

// ✅ Define the callback payload type outside the class
interface KcbCallbackPayload {
  invoiceNumber?: string;
  BillRefNumber?: string;
  reference?: string;
  status?: string;
  ResultCode?: number;
  [key: string]: any; // allow extra fields
}
export interface StkPushResponse {
  message: string;
  reference: string;
  paymentId: string;
  providerResponse: any;
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly repo: PaymentsRepository,
    private kcb: KcbBuniService,
  ) {}

  async initiate(
    user: { userId: string },
    dto: { bookingId: string; method: PaymentMethod; phone?: string },
  ) {
    const booking = await this.repo.findBooking(dto.bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== user.userId)
      throw new ForbiddenException('Not your booking');
    if (booking.payment)
      throw new BadRequestException('Payment already exists for this booking');

    const amount = 200; // TODO: calculate dynamically

    return this.repo.createPayment({
      bookingId: dto.bookingId,
      method: dto.method,
      amount,
      phone: dto.phone,
    });
  }

  async stkPush(
    user: { userId: string },
    dto: { bookingId: string; phone: string },
  ) {
    const booking = await this.repo.findBooking(dto.bookingId);

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== user.userId)
      throw new ForbiddenException('Not your booking');
    if (booking.payment)
      throw new BadRequestException('Payment already exists');

    const amount = 200;
    const reference = `INV-${Date.now()}`;

    const stkResponse: StkPushResponse = await this.kcb.stkPush({
      phone: dto.phone,
      amount,
      invoiceNumber: reference,
    });

    // ✅ Removed 'status' field; Prisma default handles it
    const payment = await this.repo.createPayment({
      bookingId: dto.bookingId,
      method: PaymentMethod.MPESA,
      amount,
      phone: dto.phone,
      reference,
    });

    return {
      message: 'STK Push sent',
      reference,
      paymentId: payment.id,
      providerResponse: stkResponse,
    };
  }

  async simulateFail(user: { userId: string }, paymentId: string) {
    const payment = await this.repo.findPayment(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');
    if (!payment.booking)
      throw new BadRequestException('Payment has no booking');
    if (payment.booking.userId !== user.userId)
      throw new ForbiddenException('Not your payment');
    if (payment.status !== PaymentStatus.INITIATED)
      throw new BadRequestException('Payment is not in INITIATED state');

    return this.repo.markFailed(paymentId);
  }

  async handleKcbCallback(payload: KcbCallbackPayload) {
    const reference =
      payload.invoiceNumber ?? payload.BillRefNumber ?? payload.reference;
    if (!reference) return;

    const success = payload.status === 'Success' || payload.ResultCode === 0;

    await this.repo.updateByReference(reference, {
      status: success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
      rawPayload: payload,
    });

    if (success) {
      await this.repo.confirmBooking(reference);
    }
  }

  async getOne(user: { userId: string; role: UserRole }, id: string) {
    const payment = await this.repo.getPaymentById(id);
    if (!payment) throw new NotFoundException('Payment not found');
    if (!payment.booking)
      throw new BadRequestException('Payment has no booking');

    if (user.role === UserRole.ADMIN) return payment;
    if (payment.booking.userId === user.userId) return payment;
    if (
      user.role === UserRole.OWNER &&
      payment.booking.parkingLot?.ownerId === user.userId
    ) {
      return payment;
    }

    throw new ForbiddenException('Not allowed to view this payment');
  }

  async list(
    user: { userId: string; role: UserRole },
    q: {
      status?: PaymentStatus;
      method?: PaymentMethod;
      bookingId?: string;
      from?: string;
      to?: string;
      limit?: string;
      offset?: string;
    },
  ) {
    const take = Math.min(Number(q.limit ?? 50), 200);
    const skip = Number(q.offset ?? 0);
    type PaymentFilter = {
      status?: PaymentStatus;
      method?: PaymentMethod;
      bookingId?: string;
      createdAt?: { gte?: Date; lte?: Date };
      booking?: { userId?: string; parkingLot?: { ownerId?: string } };
    };
    const where: PaymentFilter = {};
    if (q.status) where.status = q.status;
    if (q.method) where.method = q.method;
    if (q.bookingId) where.bookingId = q.bookingId;

    if (q.from || q.to) {
      where.createdAt = {};
      if (q.from) where.createdAt.gte = new Date(q.from);
      if (q.to) where.createdAt.lte = new Date(q.to);
    }

    if (user.role === UserRole.OWNER) {
      where.booking = { parkingLot: { ownerId: user.userId } };
    } else if (user.role === UserRole.DRIVER) {
      where.booking = { userId: user.userId };
    }

    return this.repo.listPayments(where, take, skip);
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios from 'axios';
import {
  UserRole,
  PaymentStatus,
  PaymentMethod,
  BookingStatus,
  Prisma,
} from '@prisma/client';
import { PaymentsRepository } from '../../../shared/database/repository/payments/payments.repository';
import { KcbBuniService, KcbStkResponse } from '../providers/kcb-buni.service';

export interface KcbCallbackPayload {
  invoiceNumber?: string;
  BillRefNumber?: string;
  reference?: string;
  status?: string;
  ResultCode?: number;
  [key: string]: unknown;
}
export interface StkPushResponse {
  message: string;
  reference: string;
  paymentId: string;
  providerResponse: KcbStkResponse;
}
export interface BookingWithPricing {
  startTime: Date;
  endTime: Date;
  parkingLot: {
    pricingRules: {
      type: 'HOURLY' | 'DAILY' | 'FLAT';
      amount: number;
    }[];
  };
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly repo: PaymentsRepository,
    private kcb: KcbBuniService,
  ) {}

  async stkPush(
    user: { userId: string },
    dto: { bookingId: string; phone: string },
  ) {
    if (!dto.bookingId?.trim()) {
      throw new BadRequestException('bookingId is required');
    }

    if (!dto.phone?.trim()) {
      throw new BadRequestException('phone is required');
    }

    const booking = await this.repo.findBooking(dto.bookingId.trim());

    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.userId !== user.userId) {
      throw new ForbiddenException('Not your booking');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be paid for');
    }

    if (booking.payment) {
      throw new BadRequestException('Payment already exists for this booking');
    }

    const normalizedPhone = this.normalizePhone(dto.phone);

    if (!/^254(7|1)\d{8}$/.test(normalizedPhone)) {
      throw new BadRequestException(
        'Enter a valid M-Pesa phone number in 07XXXXXXXX or 2547XXXXXXXX format',
      );
    }

    const amount = this.calculateAmount(booking);
    const reference = `INV-${Date.now()}`;

    let providerResponse: KcbStkResponse;
    let providerData: any;

    try {
      providerResponse = await this.kcb.stkPush({
        phone: normalizedPhone,
        amount,
        invoiceNumber: reference,
      });

      console.log('KCB STK INIT RESPONSE:');
      console.dir(providerResponse, { depth: null });

      providerData = (providerResponse as any)?.response ?? providerResponse;

      console.log('EXTRACTED IDS:', {
        providerRequestId: providerData?.MerchantRequestID,
        providerCheckoutId: providerData?.CheckoutRequestID,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const providerMessage =
          typeof error.response?.data === 'object' && error.response?.data
            ? (error.response.data as {
                message?: string;
                ResponseDescription?: string;
                errorMessage?: string;
              })
            : undefined;

        throw new ServiceUnavailableException(
          providerMessage?.message ||
            providerMessage?.ResponseDescription ||
            providerMessage?.errorMessage ||
            'Unable to initiate M-Pesa payment right now. Please confirm your KCB sandbox configuration and try again.',
        );
      }

      if (error instanceof Error) {
        throw new ServiceUnavailableException(error.message);
      }

      throw new ServiceUnavailableException(
        'Unable to initiate M-Pesa payment right now. Please try again later.',
      );
    }

    const payment = await this.repo.createPayment({
      bookingId: dto.bookingId,
      method: PaymentMethod.MPESA,
      amount,
      phone: normalizedPhone,
      reference,
      providerRequestId: providerData?.MerchantRequestID ?? null,
      providerCheckoutId: providerData?.CheckoutRequestID ?? null,
      rawPayload: providerResponse as unknown as Prisma.InputJsonValue,
    });

    console.log('CREATED PAYMENT:', payment);

    return {
      message: 'STK Push sent',
      reference,
      paymentId: payment.id,
      providerResponse,
    };
  }

  async handleKcbCallback(payload: any) {
    if (!payload) {
      throw new BadRequestException('Callback payload is missing');
    }

    const callback = payload?.Body?.stkCallback;

    if (!callback) {
      throw new BadRequestException('Invalid callback payload');
    }

    const checkoutRequestId = callback.CheckoutRequestID;
    const merchantRequestId = callback.MerchantRequestID;
    const resultCode = Number(callback.ResultCode ?? -1);
    const resultDesc = callback.ResultDesc ?? '';
    const success = resultCode === 0;

    const metadataItems = Array.isArray(callback.CallbackMetadata?.Item)
      ? callback.CallbackMetadata.Item
      : [];

    const getMetaValue = (name: string) =>
      metadataItems.find((item: any) => item.Name === name)?.Value;

    const mpesaReceiptNumber = getMetaValue('MpesaReceiptNumber');
    const amount = getMetaValue('Amount');
    const phoneNumber = getMetaValue('PhoneNumber');
    const transactionDate = getMetaValue('TransactionDate');

    let payment = await this.repo.getPaymentByCheckoutId(checkoutRequestId);

    if (!payment && merchantRequestId) {
      payment =
        await this.repo.getPaymentByProviderRequestId(merchantRequestId);
    }

    if (!payment) {
      throw new NotFoundException(
        `Payment not found for checkout request ID ${checkoutRequestId}`,
      );
    }

    console.log('CALLBACK MATCHED PAYMENT:', {
      reference: payment.reference,
      checkoutRequestId,
      merchantRequestId,
      currentStatus: payment.status,
    });

    if (payment.status !== PaymentStatus.INITIATED) {
      return {
        message: 'Payment already processed',
        reference: payment.reference,
        currentStatus: payment.status,
      };
    }

    const updatedPayment = await this.repo.markPaymentResultByReference(
      payment.reference,
      success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
      mpesaReceiptNumber,
      payload as Prisma.InputJsonValue,
    );

    console.log('CALLBACK UPDATED PAYMENT:', updatedPayment);

    return {
      message: success ? 'Payment marked successful' : 'Payment marked failed',
      reference: payment.reference,
      resultDesc,
      amount,
      phoneNumber,
      transactionDate,
    };
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
  async getStatusByReference(
    user: { userId: string; role: UserRole },
    reference: string,
  ) {
    const payment = await this.repo.getPaymentByReference(reference);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

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
  private normalizePhone(phone: string) {
    const normalized = phone.replace(/\s+/g, '');

    if (normalized.startsWith('0')) {
      return `254${normalized.slice(1)}`;
    }

    if (normalized.startsWith('+254')) {
      return normalized.slice(1);
    }

    return normalized;
  }

  private calculateAmount(booking: BookingWithPricing): number {
    const pricingRule = booking.parkingLot?.pricingRules?.[0];

    if (!pricingRule) {
      throw new BadRequestException(
        'No active pricing rule found for parking lot',
      );
    }

    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const diffMs = end.getTime() - start.getTime();

    if (diffMs <= 0) {
      throw new BadRequestException('Invalid booking duration');
    }

    if (pricingRule.type === 'HOURLY') {
      const hours = Math.ceil(diffMs / (1000 * 60 * 60));
      return hours * pricingRule.amount;
    }

    if (pricingRule.type === 'DAILY') {
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return days * pricingRule.amount;
    }

    if (pricingRule.type === 'FLAT') {
      return pricingRule.amount;
    }

    throw new BadRequestException('Unsupported pricing type');
  }
}

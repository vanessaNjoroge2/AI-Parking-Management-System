import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ChatMessageDto } from './dto/chat-message.dto';
import { BookingsRepository } from '../../shared/database/repository/bookings/bookings.repository';
import { ParkingLotsRepository } from '../../shared/database/repository/parking-lots/parking-lots.repository';

interface OpenRouterResponse {
  choices?: Array<{ message?: { content?: string } }>;
  model?: string;
  usage?: unknown;
}

@Injectable()
export class ChatService {
  private readonly systemPrompts: Record<string, string> = {
    DRIVER:
      'You are ParkSmart Assistant helping a driver. ' +
      'Help with searching parking lots, viewing lot details, making and managing bookings, payments, and account settings. ' +
      'Be concise, friendly, and guide step-by-step when needed.',
    OWNER:
      'You are ParkSmart Assistant helping a parking lot owner. ' +
      'Help with adding and editing lots, managing today\'s bookings, check-in/check-out, viewing analytics, and account settings. ' +
      'Be concise, friendly, and guide step-by-step when needed.',
    DEFAULT:
      'You are ParkSmart Assistant, a helpful AI assistant for the AI Parking Management System. ' +
      'Answer questions about parking lot search, bookings, payments, owner dashboards, and account help. ' +
      'Be concise, friendly, and guide users step-by-step when needed.',
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly bookingsRepo: BookingsRepository,
    private readonly parkingLotsRepo: ParkingLotsRepository,
  ) {}

  private async buildContextBlock(userId: string, role?: string): Promise<string> {
    const today = new Date();
    const start = new Date(today); start.setHours(0, 0, 0, 0);
    const end = new Date(today); end.setHours(23, 59, 59, 999);

    if (role === 'DRIVER') {
      const bookings = await this.bookingsRepo.findMyBookings(userId);
      if (!bookings.length) return 'The driver currently has no bookings.';

      const lines = bookings.slice(0, 10).map((b) =>
        `- Booking ID: ${b.id.slice(0, 8)} | Lot: ${b.parkingLot?.name ?? 'N/A'} | ` +
        `Status: ${b.status} | From: ${new Date(b.startTime).toLocaleString()} | ` +
        `To: ${new Date(b.endTime).toLocaleString()} | Cars: ${b.numberOfCars} | ` +
        `Payment: ${b.payment?.status ?? 'N/A'}`,
      );
      return `Driver's recent bookings (up to 10):\n${lines.join('\n')}`;
    }

    if (role === 'OWNER' || role === 'ADMIN') {
      const [lots, todayBookings] = await Promise.all([
        this.parkingLotsRepo.findOwnerLots(userId),
        this.bookingsRepo.findOwnerBookings(userId, start, end),
      ]);

      const lotLines = lots.map((l) => {
        const pricing = l.pricingRules?.[0];
        return `- ${l.name} (ID: ${l.id.slice(0, 8)}) | Capacity: ${l.capacityTotal} | ` +
          `Active: ${l.isActive} | Pricing: ${pricing ? `${pricing.type} ${pricing.amount} ${pricing.currency}` : 'not set'}`;
      });

      const bookingLines = todayBookings.slice(0, 10).map((b) =>
        `- Booking ${b.id.slice(0, 8)} | Lot: ${b.parkingLot?.name ?? 'N/A'} | ` +
        `Driver: ${b.user?.fullName ?? 'N/A'} | Status: ${b.status} | ` +
        `From: ${new Date(b.startTime).toLocaleString()} | Cars: ${b.numberOfCars}`,
      );

      const parts: string[] = [];
      if (lotLines.length) parts.push(`Owner's parking lots:\n${lotLines.join('\n')}`);
      else parts.push('Owner has no parking lots yet.');
      if (bookingLines.length) parts.push(`Today's bookings (up to 10):\n${bookingLines.join('\n')}`);
      else parts.push("No bookings for today.");
      return parts.join('\n\n');
    }

    return '';
  }

  async createReply(message: string, history: ChatMessageDto[] = [], role?: string, userId?: string) {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    const model =
      this.configService.get<string>('OPENROUTER_MODEL') ??
      'openai/gpt-oss-20b:free';
    const siteUrl =
      this.configService.get<string>('OPENROUTER_SITE_URL') ??
      this.configService.get<string>('FRONTEND_URL') ??
      'http://localhost:5173';

    if (!apiKey) {
      throw new InternalServerErrorException('OPENROUTER_API_KEY is not configured');
    }

    const systemPrompt =
      (role && this.systemPrompts[role]) ?? this.systemPrompts['DEFAULT'];

    const contextBlock = userId ? await this.buildContextBlock(userId, role) : '';

    const systemContent = contextBlock
      ? `${systemPrompt}\n\nCurrent user data for context:\n${contextBlock}`
      : systemPrompt;

    const messages = [
      { role: 'system', content: systemContent },
      ...history.map((item) => ({ role: item.role, content: item.content })),
      { role: 'user', content: message },
    ];

    try {
      const response = await axios.post<OpenRouterResponse>(
        'https://openrouter.ai/api/v1/chat/completions',
        { model, messages, temperature: 0.4 },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': siteUrl,
            'X-Title': 'ParkSmart Assistant',
          },
        },
      );

      const reply = response.data?.choices?.[0]?.message?.content?.trim();

      if (!reply) {
        throw new InternalServerErrorException('Failed to generate a response');
      }

      return { reply, model: response.data?.model, usage: response.data?.usage };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message =
          (error.response?.data as { error?: { message?: string } } | undefined)
            ?.error?.message ?? error.message;
        throw new InternalServerErrorException(
          `OpenRouter request failed${status ? ` (${status})` : ''}: ${message}`,
        );
      }
      throw error;
    }
  }
}

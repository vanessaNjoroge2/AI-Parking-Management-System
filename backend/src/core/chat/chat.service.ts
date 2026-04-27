import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ChatMessageDto } from './dto/chat-message.dto';

interface OpenRouterResponse {
  choices?: Array<{ message?: { content?: string } }>;
  model?: string;
  usage?: unknown;
}

@Injectable()
export class ChatService {
  private readonly systemPrompt =
    'You are ParkSmart Assistant, a helpful AI assistant for the AI Parking Management System. ' +
    'Answer questions about parking lot search, bookings, payments, owner dashboards, and account help. ' +
    'Be concise, friendly, and guide users step-by-step when needed.';

  constructor(private readonly configService: ConfigService) {}

  async createReply(message: string, history: ChatMessageDto[] = []) {
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

    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...history.map((item) => ({ role: item.role, content: item.content })),
      { role: 'user', content: message },
    ];

    try {
      const response = await axios.post<OpenRouterResponse>(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model,
          messages,
          temperature: 0.4,
        },
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

      return {
        reply,
        model: response.data?.model,
        usage: response.data?.usage,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message =
          (error.response?.data as { error?: { message?: string } } | undefined)
            ?.error?.message ??
          error.message;
        throw new InternalServerErrorException(
          `OpenRouter request failed${status ? ` (${status})` : ''}: ${message}`,
        );
      }
      throw error;
    }
  }
}

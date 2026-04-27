import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { Public } from '../../shared/decorators/public.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Public()
  @Post()
  async createChat(@Body() body: ChatRequestDto) {
    return this.chatService.createReply(body.message, body.history ?? [], body.role, body.userId);
  }
}

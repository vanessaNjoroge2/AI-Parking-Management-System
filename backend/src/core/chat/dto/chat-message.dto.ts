import { IsIn, IsString } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @IsIn(['user', 'assistant', 'system'])
  role: 'user' | 'assistant' | 'system';

  @IsString()
  content: string;
}

import { ChatService } from '../../../shared/services/chatService';

export class MobileChatService {
  static async getConversations() {
    return ChatService.getConversationsForAdmin();
  }

  static async getMessages(conversationId: bigint) {
    return ChatService.getMessages(conversationId);
  }
}

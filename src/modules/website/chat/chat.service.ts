import { ChatService } from '../../../shared/services/chatService';

export class WebsiteChatService {
  static async getConversations(userId: bigint) {
    return ChatService.getConversationsForUser(userId);
  }

  static async getOrCreateConversation(userId: bigint) {
    return ChatService.getOrCreateConversation(userId);
  }

  static async getMessages(conversationId: bigint) {
    return ChatService.getMessages(conversationId);
  }
}

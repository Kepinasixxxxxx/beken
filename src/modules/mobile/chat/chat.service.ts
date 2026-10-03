import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';
import { ChatService } from '../../../shared/services/chatService';

export class MobileChatService {
  static async getConversations() {
    const conversations = await ChatService.getConversationsForAdmin();
    const unread = await prisma.message.groupBy({
      by: ['conversationId'],
      _count: { id: true },
      where: { senderType: 'user', isRead: false },
    });
    const unreadMap = new Map(unread.map((u) => [u.conversationId.toString(), u._count.id]));
    return conversations.map((c) => ({ ...c, unreadCount: unreadMap.get(c.id.toString()) ?? 0 }));
  }

  static async startConversation(adminId: bigint, data: { userId: string | number; messageText?: string }) {
    if (!data.userId) throw new AppError('Pilih pelanggan terlebih dahulu.', 400);
    const userId = BigInt(data.userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Pelanggan tidak ditemukan.', 404);
    const conversation = await ChatService.getOrCreateConversation(userId, adminId);
    if (data.messageText?.trim()) {
      await ChatService.saveMessage({ conversationId: conversation.id, senderType: 'admin', senderId: adminId, messageText: data.messageText.trim() });
    }
    return conversation;
  }

  static async getMessages(conversationId: bigint) {
    await prisma.message.updateMany({
      where: { conversationId, senderType: 'user', isRead: false },
      data: { isRead: true },
    });
    return ChatService.getMessages(conversationId);
  }
}

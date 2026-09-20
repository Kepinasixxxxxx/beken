import { prisma } from '../../config/prisma';

export class ChatService {
  static async getOrCreateConversation(userId: bigint, adminId?: bigint) {
    let conversation = await prisma.conversation.findFirst({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, profilePhoto: true } },
        admin: { select: { id: true, name: true } },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { userId, adminId },
        include: {
          user: { select: { id: true, name: true, profilePhoto: true } },
          admin: { select: { id: true, name: true } },
        },
      });
    }

    return conversation;
  }

  static async getConversationsForUser(userId: bigint) {
    return prisma.conversation.findMany({
      where: { userId },
      include: {
        admin: { select: { name: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  static async getConversationsForAdmin() {
    return prisma.conversation.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, profilePhoto: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  static async getMessages(conversationId: bigint) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async saveMessage(data: { conversationId: bigint; senderType: 'user' | 'admin'; senderId: bigint; messageText?: string; imageAttachment?: string }) {
    const message = await prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderType: data.senderType,
        senderId: data.senderId,
        messageText: data.messageText,
        imageAttachment: data.imageAttachment,
      },
    });

    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }
}

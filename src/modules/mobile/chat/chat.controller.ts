import { Response, NextFunction } from 'express';
import { AuthenticatedAdminRequest } from '../../../middlewares/mobile/authenticate';
import { MobileChatService } from './chat.service';
import { sendSuccess, toBigInt } from '../../../shared/utils/response';

export const getConversations = async (_req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const conversations = await MobileChatService.getConversations();
    return sendSuccess(res, 'Daftar percakapan admin berhasil diambil', conversations);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const conversationId = toBigInt(req.params.id);
    const messages = await MobileChatService.getMessages(conversationId);
    return sendSuccess(res, 'Riwayat pesan berhasil diambil', messages);
  } catch (error) {
    next(error);
  }
};

export const startConversation = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const conversation = await MobileChatService.startConversation(req.user!.id, req.body);
    return sendSuccess(res, 'Percakapan berhasil dibuat', conversation, 201);
  } catch (error) {
    next(error);
  }
};

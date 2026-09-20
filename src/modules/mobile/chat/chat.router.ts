import { Router } from 'express';
import * as chatController from './chat.controller';
import { authenticateMobile } from '../../../middlewares/mobile/authenticate';

const router = Router();

router.use(authenticateMobile);

router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id/messages', chatController.getMessages);

export default router;

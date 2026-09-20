import { Router } from 'express';
import * as chatController from './chat.controller';
import { authenticateWebsite } from '../../../middlewares/website/authenticate';

const router = Router();

router.use(authenticateWebsite);

router.get('/conversations', chatController.getConversations);
router.post('/conversations', chatController.getOrCreateConversation);
router.get('/conversations/:id/messages', chatController.getMessages);

export default router;

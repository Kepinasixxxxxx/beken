import { Router } from 'express';
import * as notificationsController from './notifications.controller';
import { authenticateWebsite } from '../../../middlewares/website/authenticate';

const router = Router();

router.use(authenticateWebsite);

router.get('/', notificationsController.getNotifications);
router.patch('/:id/read', notificationsController.markAsRead);

export default router;

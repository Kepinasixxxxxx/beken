import { Router } from 'express';
import * as accountController from './account.controller';
import { authenticateMobile } from '../../../middlewares/mobile/authenticate';

const router = Router();

router.use(authenticateMobile);

router.get('/me', accountController.getProfile);
router.put('/me', accountController.updateProfile);
router.patch('/change-password', accountController.changePassword);
router.get('/security', accountController.getSecurity);
router.patch('/pin', accountController.setPin);
router.patch('/settings', accountController.updateSettings);
router.delete('/sessions/:id', accountController.revokeSession);

export default router;

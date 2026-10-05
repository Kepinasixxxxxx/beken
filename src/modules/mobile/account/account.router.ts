import { Router } from 'express';
import * as accountController from './account.controller';
import { authenticateMobile } from '../../../middlewares/mobile/authenticate';

const router = Router();

router.use(authenticateMobile);

router.get('/me', accountController.getProfile);
router.put('/me', accountController.updateProfile);
router.patch('/change-password', accountController.changePassword);

export default router;

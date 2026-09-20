import { Router } from 'express';
import * as storeProfileController from './store-profile.controller';
import { authenticateMobile } from '../../../middlewares/mobile/authenticate';

const router = Router();

router.use(authenticateMobile);

router.get('/', storeProfileController.getProfile);
router.put('/', storeProfileController.updateProfile);

export default router;

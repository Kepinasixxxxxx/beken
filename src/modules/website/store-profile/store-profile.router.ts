import { Router } from 'express';
import * as storeProfileController from './store-profile.controller';

const router = Router();

router.get('/', storeProfileController.getProfile);

export default router;

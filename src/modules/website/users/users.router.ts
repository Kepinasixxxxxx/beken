import { Router } from 'express';
import * as usersController from './users.controller';
import { authenticateWebsite } from '../../../middlewares/website/authenticate';

const router = Router();

router.use(authenticateWebsite);

router.get('/me', usersController.getProfile);
router.put('/me', usersController.updateProfile);

export default router;

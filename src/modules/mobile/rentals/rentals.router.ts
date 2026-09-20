import { Router } from 'express';
import * as rentalsController from './rentals.controller';
import { authenticateMobile } from '../../../middlewares/mobile/authenticate';

const router = Router();

router.use(authenticateMobile);

router.get('/calendar', rentalsController.getCalendar);
router.patch('/:id/status', rentalsController.updateStatus);

export default router;

import { Router } from 'express';
import * as rentalsController from './rentals.controller';
import { authenticateMobile } from '../../../middlewares/mobile/authenticate';
import { upload } from '../../../config/multer';

const router = Router();

router.use(authenticateMobile);

router.get('/calendar', rentalsController.getCalendar);
router.patch('/:id/status', rentalsController.updateStatus);
router.patch('/:id/handover', upload.single('agreementPhoto'), rentalsController.handover);
router.patch('/:id/refund', upload.single('refundProof'), rentalsController.refund);

export default router;

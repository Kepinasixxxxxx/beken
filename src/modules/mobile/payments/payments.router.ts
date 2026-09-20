import { Router } from 'express';
import * as paymentsController from './payments.controller';
import { authenticateMobile } from '../../../middlewares/mobile/authenticate';

const router = Router();

router.use(authenticateMobile);

router.get('/', paymentsController.getAll);
router.patch('/:id/verify', paymentsController.verifyPayment);

export default router;

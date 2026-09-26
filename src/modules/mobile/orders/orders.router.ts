import { Router } from 'express';
import * as ordersController from './orders.controller';
import { authenticateMobile } from '../../../middlewares/mobile/authenticate';

const router = Router();

router.use(authenticateMobile);

router.get('/', ordersController.getAll);
router.get('/:id', ordersController.getById);
router.get('/:id/surat-perjanjian', ordersController.rentalAgreementPdf);
router.patch('/:id/confirm', ordersController.confirmOrder);
router.patch('/:id/progress', ordersController.updateProgress);
router.patch('/:id/status', ordersController.changeStatus);

export default router;

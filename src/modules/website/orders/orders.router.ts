import { Router } from 'express';
import * as ordersController from './orders.controller';
import { authenticateWebsite } from '../../../middlewares/website/authenticate';
import { validate } from '../../../middlewares/validate';
import { createOrderSchema } from './orders.validator';

const router = Router();

router.use(authenticateWebsite);

router.post('/', validate(createOrderSchema), ordersController.createOrder);
router.get('/', ordersController.getMyOrders);
router.get('/:id', ordersController.getOrderDetail);
router.get('/:id/status-history', ordersController.getStatusHistory);

export default router;

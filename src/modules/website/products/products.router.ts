import { Router } from 'express';
import * as productsController from './products.controller';

const router = Router();

router.get('/', productsController.getAll);
router.get('/:id', productsController.getById);
router.get('/:id/availability', productsController.getAvailability);

export default router;

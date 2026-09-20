import { Router } from 'express';
import * as customersController from './customers.controller';
import { authenticateMobile } from '../../../middlewares/mobile/authenticate';

const router = Router();

router.use(authenticateMobile);

router.get('/', customersController.getAll);
router.get('/:id', customersController.getDetail);

export default router;

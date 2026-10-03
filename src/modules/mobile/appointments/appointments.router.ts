import { Router } from 'express';
import * as appointmentsController from './appointments.controller';
import { authenticateMobile } from '../../../middlewares/mobile/authenticate';

const router = Router();

router.use(authenticateMobile);

router.get('/', appointmentsController.list);
router.post('/', appointmentsController.create);
router.delete('/:id', appointmentsController.remove);

export default router;

import { Router } from 'express';
import * as adminsController from './admins.controller';
import { authenticateMobile } from '../../../middlewares/mobile/authenticate';
import { authorizeRoles } from '../../../middlewares/mobile/authorize';

const router = Router();

router.use(authenticateMobile);
router.use(authorizeRoles('owner')); // Owner only guard

router.get('/', adminsController.getAll);
router.get('/:id', adminsController.getById);
router.post('/', adminsController.create);
router.put('/:id', adminsController.update);
router.delete('/:id', adminsController.remove);

export default router;

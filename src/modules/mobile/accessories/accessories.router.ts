import { Router } from 'express';
import * as accessoriesController from './accessories.controller';
import { authenticateMobile } from '../../../middlewares/mobile/authenticate';
import { validate } from '../../../middlewares/validate';
import { createAccessorySchema, updateAccessorySchema } from './accessories.validator';

const router = Router();

router.use(authenticateMobile);

router.get('/', accessoriesController.getAll);
router.get('/:id', accessoriesController.getById);
router.post('/', validate(createAccessorySchema), accessoriesController.create);
router.put('/:id', validate(updateAccessorySchema), accessoriesController.update);
router.delete('/:id', accessoriesController.remove);

export default router;

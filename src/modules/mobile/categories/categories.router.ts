import { Router } from 'express';
import * as categoriesController from './categories.controller';
import { authenticateMobile } from '../../../middlewares/mobile/authenticate';
import { validate } from '../../../middlewares/validate';
import { createCategorySchema, updateCategorySchema } from './categories.validator';

const router = Router();

router.use(authenticateMobile);

router.get('/', categoriesController.getAll);
router.get('/:id', categoriesController.getById);
router.post('/', validate(createCategorySchema), categoriesController.create);
router.put('/:id', validate(updateCategorySchema), categoriesController.update);
router.delete('/:id', categoriesController.remove);

export default router;

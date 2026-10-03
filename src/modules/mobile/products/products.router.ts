import { Router } from 'express';
import * as productsController from './products.controller';
import { authenticateMobile } from '../../../middlewares/mobile/authenticate';
import { upload } from '../../../config/multer';
import { validate } from '../../../middlewares/validate';
import { createProductSchema, updateProductSchema } from './products.validator';

const router = Router();

router.use(authenticateMobile);

router.get('/', productsController.getAll);
router.get('/:id', productsController.getById);
router.post('/', validate(createProductSchema), productsController.create);
router.put('/:id', validate(updateProductSchema), productsController.update);
router.delete('/:id', productsController.remove);
router.post('/:id/images', upload.array('productImages', 10), productsController.uploadImages);
router.patch('/:id/visibility', productsController.toggleVisibility);
router.put('/:id/variants', productsController.updateVariants);

export default router;

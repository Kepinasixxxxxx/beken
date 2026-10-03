import { Router } from 'express';
import * as ordersController from './orders.controller';
import { authenticateMobile } from '../../../middlewares/mobile/authenticate';
import { upload } from '../../../config/multer';

const router = Router();

router.use(authenticateMobile);

router.get('/', ordersController.getAll);
router.get('/:id', ordersController.getById);
router.get('/:id/surat-perjanjian', ordersController.rentalAgreementPdf);
router.patch('/:id/confirm', ordersController.confirmOrder);
router.patch('/:id/quote', ordersController.submitQuote);
router.put('/:id/sizes', ordersController.replaceSizes);
router.patch('/:id/ship', ordersController.shipOrder);
router.post('/:id/photos', upload.array('orderPhotos', 10), ordersController.uploadPhotos);
router.delete('/photos/:photoId', ordersController.deletePhoto);
router.patch('/:id/progress', ordersController.updateProgress);
router.patch('/:id/status', ordersController.changeStatus);

export default router;

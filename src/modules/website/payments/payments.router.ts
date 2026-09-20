import { Router } from 'express';
import * as paymentsController from './payments.controller';
import { authenticateWebsite } from '../../../middlewares/website/authenticate';
import { upload } from '../../../config/multer';

const router = Router();

router.use(authenticateWebsite);

router.post('/proof', upload.single('proofImage'), paymentsController.uploadPaymentProof);

export default router;

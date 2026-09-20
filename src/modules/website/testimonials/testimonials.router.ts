import { Router } from 'express';
import * as testimonialsController from './testimonials.controller';
import { authenticateWebsite } from '../../../middlewares/website/authenticate';

const router = Router();

router.get('/', testimonialsController.getPublic);
router.post('/', authenticateWebsite, testimonialsController.create);

export default router;

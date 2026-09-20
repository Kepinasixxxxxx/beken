import { Router } from 'express';
import * as reportsController from './reports.controller';
import { authenticateMobile } from '../../../middlewares/mobile/authenticate';

const router = Router();

router.use(authenticateMobile);

router.get('/summary', reportsController.getSummaryReport);

export default router;

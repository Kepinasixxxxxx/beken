import { Router } from 'express';
import * as accessoriesController from './accessories.controller';

const router = Router();

router.get('/', accessoriesController.getAll);

export default router;

import { Router, Request, Response, NextFunction } from 'express';
import { MidtransWebhookService } from '../modules/webhooks/midtrans.service';
import { sendSuccess } from '../shared/utils/response';

const router = Router();

router.post('/midtrans', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await MidtransWebhookService.handleNotification(req.body);
    return sendSuccess(res, 'Midtrans notification processed');
  } catch (error) {
    next(error);
  }
});

export default router;

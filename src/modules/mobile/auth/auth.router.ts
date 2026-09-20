import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../../middlewares/validate';
import {
  mobileLoginSchema,
  mobileRefreshSchema,
  mobileLogoutSchema,
  mobileForgotPasswordSchema,
  mobileResetPasswordSchema,
} from './auth.validator';

const router = Router();

router.post('/login', validate(mobileLoginSchema), authController.login);
router.post('/refresh', validate(mobileRefreshSchema), authController.refresh);
router.post('/logout', validate(mobileLogoutSchema), authController.logout);
router.post('/forgot-password', validate(mobileForgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(mobileResetPasswordSchema), authController.resetPassword);

export default router;

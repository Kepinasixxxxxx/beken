import { Router } from 'express';
import websiteAuthRouter from '../modules/website/auth/auth.router';
import websiteUsersRouter from '../modules/website/users/users.router';
import websiteStoreProfileRouter from '../modules/website/store-profile/store-profile.router';
import websiteCategoriesRouter from '../modules/website/categories/categories.router';
import websiteProductsRouter from '../modules/website/products/products.router';
import websiteAccessoriesRouter from '../modules/website/accessories/accessories.router';
import websiteOrdersRouter from '../modules/website/orders/orders.router';
import websitePaymentsRouter from '../modules/website/payments/payments.router';
import websiteChatRouter from '../modules/website/chat/chat.router';
import websiteNotificationsRouter from '../modules/website/notifications/notifications.router';
import websiteTestimonialsRouter from '../modules/website/testimonials/testimonials.router';

const router = Router();

router.use('/auth', websiteAuthRouter);
router.use('/users', websiteUsersRouter);
router.use('/store-profile', websiteStoreProfileRouter);
router.use('/categories', websiteCategoriesRouter);
router.use('/products', websiteProductsRouter);
router.use('/accessories', websiteAccessoriesRouter);
router.use('/orders', websiteOrdersRouter);
router.use('/payments', websitePaymentsRouter);
router.use('/chat', websiteChatRouter);
router.use('/notifications', websiteNotificationsRouter);
router.use('/testimonials', websiteTestimonialsRouter);

export default router;

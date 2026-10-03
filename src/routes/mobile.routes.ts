import { Router } from 'express';
import mobileAuthRouter from '../modules/mobile/auth/auth.router';
import mobileAccountRouter from '../modules/mobile/account/account.router';
import mobileAdminsRouter from '../modules/mobile/admins/admins.router';
import mobileStoreProfileRouter from '../modules/mobile/store-profile/store-profile.router';
import mobileCategoriesRouter from '../modules/mobile/categories/categories.router';
import mobileProductsRouter from '../modules/mobile/products/products.router';
import mobileAccessoriesRouter from '../modules/mobile/accessories/accessories.router';
import mobileOrdersRouter from '../modules/mobile/orders/orders.router';
import mobilePaymentsRouter from '../modules/mobile/payments/payments.router';
import mobileRentalsRouter from '../modules/mobile/rentals/rentals.router';
import mobileCustomersRouter from '../modules/mobile/customers/customers.router';
import mobileReportsRouter from '../modules/mobile/reports/reports.router';
import mobileChatRouter from '../modules/mobile/chat/chat.router';
import mobileNotificationsRouter from '../modules/mobile/notifications/notifications.router';
import mobileAppointmentsRouter from '../modules/mobile/appointments/appointments.router';

const router = Router();

router.use('/auth', mobileAuthRouter);
router.use('/account', mobileAccountRouter);
router.use('/admins', mobileAdminsRouter);
router.use('/store-profile', mobileStoreProfileRouter);
router.use('/categories', mobileCategoriesRouter);
router.use('/products', mobileProductsRouter);
router.use('/accessories', mobileAccessoriesRouter);
router.use('/orders', mobileOrdersRouter);
router.use('/payments', mobilePaymentsRouter);
router.use('/rentals', mobileRentalsRouter);
router.use('/appointments', mobileAppointmentsRouter);
router.use('/customers', mobileCustomersRouter);
router.use('/reports', mobileReportsRouter);
router.use('/chat', mobileChatRouter);
router.use('/notifications', mobileNotificationsRouter);

export default router;

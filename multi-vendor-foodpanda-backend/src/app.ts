import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import restaurantRoutes from './modules/restaurant/restaurant.routes.js';
import discoveryRoutes from './modules/discovery/discovery.routes.js';
import paymentsRoutes from './modules/payments/payments.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';
import ridersRoutes from './modules/riders/riders.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/restaurants', restaurantRoutes);
app.use('/api/v1/discovery', discoveryRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/riders', ridersRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error Handling
app.use(errorHandler);

export default app;

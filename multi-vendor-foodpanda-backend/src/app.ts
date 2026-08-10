const express = require('express');

const cors = require('cors');

const helmet = require('helmet');

const { errorHandler } = require('./middlewares/error.middleware');

const authRoutes = require('./modules/auth/auth.routes');

const restaurantRoutes = require('./modules/restaurant/restaurant.routes');

const discoveryRoutes = require('./modules/discovery/discovery.routes');

const paymentsRoutes = require('./modules/payments/payments.routes');

const ordersRoutes = require('./modules/orders/orders.routes');

const ridersRoutes = require('./modules/riders/riders.routes');

const adminRoutes = require('./modules/admin/admin.routes');


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

module.exports = app;

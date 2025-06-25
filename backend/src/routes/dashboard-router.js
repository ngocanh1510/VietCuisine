// routes/dashboardRoutes.js
import express from 'express';
import {
  getDailyRevenue,
  getNewUsers,
  getDailyOrders,
  getMonthlyRevenue,
  getRevenueByMonth,
  getTopIngredients
} from '../controllers/dashboard-controller.js';

const DashboardRouter = express.Router();

DashboardRouter.get('/daily-revenue', getDailyRevenue);
DashboardRouter.get('/new-users', getNewUsers);
DashboardRouter.get('/daily-orders', getDailyOrders);
DashboardRouter.get('/monthly-revenue', getMonthlyRevenue);
DashboardRouter.get('/revenue-by-month', getRevenueByMonth);
DashboardRouter.get('/top-ingredients', getTopIngredients);

export default DashboardRouter;

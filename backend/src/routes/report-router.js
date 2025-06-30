import express from 'express';
import { createReport } from '../controllers/report-controller.js';
import authMiddleware from '../middlewares/auth-middlewares.js';
const ReportRouter = express.Router();

ReportRouter.post('/', authMiddleware, createReport);

export default ReportRouter;

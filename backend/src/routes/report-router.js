import express from 'express';
import { createReport,getAllReports,deleteReportedContent } from '../controllers/report-controller.js';
import authMiddleware from '../middlewares/auth-middlewares.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';
const ReportRouter = express.Router();

ReportRouter.post('/', authMiddleware, createReport);
ReportRouter.get('/all', authMiddleware, authorizeRoles('admin'), getAllReports);
ReportRouter.delete('/:targetType/:targetId', authMiddleware, authorizeRoles('admin'), deleteReportedContent);

export default ReportRouter;

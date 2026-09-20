import { Response, NextFunction } from 'express';
import { AuthenticatedAdminRequest } from '../../../middlewares/mobile/authenticate';
import { MobileReportsService } from './reports.service';
import { sendSuccess } from '../../../shared/utils/response';

export const getSummaryReport = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await MobileReportsService.getSummaryReport(startDate as string, endDate as string);
    return sendSuccess(res, 'Laporan ringkasan berhasil diambil', summary);
  } catch (error) {
    next(error);
  }
};

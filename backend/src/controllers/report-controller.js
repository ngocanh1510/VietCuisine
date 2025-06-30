import ReportModel from "../models/Report.js";

export const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;
    const userId = req.user.id; // Lấy userId từ token đã xác thực

    if (!['posts', 'reels', 'comments'].includes(targetType)) {
      return res.status(400).json({ message: 'Loại nội dung không hợp lệ.' });
    }

    const report = new ReportModel({ targetType, targetId, reason, userId });
    await report.save();

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Không thể tạo báo cáo.', error });
  }
}
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
};

export const getAllReports = async (req, res) => {
  try {
    const { from, to, targetType } = req.query;

    const filter = {};
    if (from || to) {
      filter.reportedAt = {};
      if (from) filter.reportedAt.$gte = new Date(from);
      if (to) filter.reportedAt.$lte = new Date(to);
    }

    if (targetType) {
      filter.targetType = targetType;
    }

    let reports;

    // Nếu là báo cáo comment thì cần nested populate
    if (targetType === "comments") {
      reports = await ReportModel.find(filter)
        .populate("userId", "name avatar email")
        .populate({
          path: "targetId", // comment
          populate: {
            path: "targetId", // bài viết chứa comment
            model: "posts", // hoặc "posts" tùy bạn đặt tên
            select: "title image content comments",
          },
        })
        .sort({ reportedAt: -1 });
    } else {
      // Nếu là posts hoặc reels
      reports = await ReportModel.find(filter)
        .populate("userId", "name avatar email")
        .populate("targetId")
        .sort({ reportedAt: -1 });
    }

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách báo cáo",
      error: error.message,
    });
  }
};

export const deleteReportedContent = async (req, res) => {
  const { targetType, targetId } = req.params;
  try {
    let result;
    if (targetType === 'posts') {
      result = await PostModel.findByIdAndDelete(targetId);
    } else if (targetType === 'comments') {
      result = await CommentModel.findByIdAndDelete(targetId);
    } else if (targetType === 'reels') {
      result = await ReelModel.findByIdAndDelete(targetId);
    } else {
      return res.status(400).json({ message: 'Loại nội dung không hợp lệ' });
    }

    if (!result) {
      return res.status(404).json({ message: 'Không tìm thấy nội dung để xoá' });
    }

    res.status(200).json({ message: 'Đã xoá nội dung bị báo cáo' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xoá nội dung', error });
  }
};
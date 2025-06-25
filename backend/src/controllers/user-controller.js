import AccountModel from "../models/Account.js";
import Account from "../models/Account.js"
import UserModel from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const accounts = await Account.find()
      .populate('user')
      .select('-password'); // Ẩn password

    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng.', error });
  }
};

export const updateAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await AccountModel.findById(id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    user.status = user.status === 'banned' ? 'active' : 'banned';
    await user.save();

    res.json({
      message: user.status === 'banned' ? "Đã cấm người dùng" : "Đã bỏ cấm",
      user
    });
  } catch (err) {
    console.error("Lỗi khi cập nhật trạng thái user:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
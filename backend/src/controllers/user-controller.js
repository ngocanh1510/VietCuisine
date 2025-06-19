import Account from "../models/Account.js"

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
    const { status } = req.body;
    const { id } = req.params;

    if (!['active', 'banned'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }

    const account = await Account.findById(id);
    if (!account) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    }

    account.status = status;
    await account.save();

    res.status(200).json({ message: 'Cập nhật trạng thái thành công.', account });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái.', error });
  }
};
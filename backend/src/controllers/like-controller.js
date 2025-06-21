import Like from '../models/Like.js';
import Post from '../models/Post.js'; 
import Reel from '../models/Reel.js';

export const toggleLike = async (req, res) => {
  try {
    const { targetId, onModel } = req.body;
    const userId = req.user.id;

    if (!['posts', 'reels'].includes(onModel)) {
      return res.status(400).json({ message: 'Loại nội dung không hợp lệ.' });
    }

    // Kiểm tra like đã tồn tại chưa
    const existingLike = await Like.findOne({ userId, targetId, onModel });

    if (existingLike) {
      // Nếu đã like → unlike
      await Like.deleteOne({ _id: existingLike._id });

      // Giảm likesCount nếu là Post hoặc Reel
      if (onModel === 'posts') {
        await Post.findByIdAndUpdate(targetId, { $inc: { likesCount: -1 } });
      } else await Reel.findByIdAndUpdate(targetId, { $inc: { likesCount: -1 } });

      return res.status(200).json({ liked: false, message: 'Đã bỏ like.' });
    } else {
      // Nếu chưa like → thêm like
      await Like.create({ userId, targetId, onModel });

      if (onModel === 'posts') {
        await Post.findByIdAndUpdate(targetId, { $inc: { likesCount: 1 } });
      } else await Reel.findByIdAndUpdate(targetId, { $inc: { likesCount: 1 } });

      return res.status(201).json({ liked: true, message: 'Đã like.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi like/bỏ like.', error });
  }
};


export const getLikes = async (req, res) => {
  try {
    const { targetId, onModel } = req.query;
    
    // Kiểm tra bắt buộc targetId và onModel
    if (!targetId || !onModel) {
      return res.status(400).json({ message: 'targetId và onModel là bắt buộc.' });
    }

    // Tìm tất cả lượt like cho mục được truyền qua query
    const likes = await Like.find({ targetId, onModel })
      .populate('userId', 'name avatar email'); // populate thông tin user: name, avatar và email

    res.status(200).json(likes);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách likes.', error: error.message });
  }
};
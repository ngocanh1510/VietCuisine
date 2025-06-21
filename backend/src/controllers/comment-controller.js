import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Reel from '../models/Reel.js';

export const createComment = async (req, res) => {
  try {
    const { targetId, onModel, content } = req.body;
    const userId = req.user.id; // từ middleware xác thực

    if (!['posts', 'reels'].includes(onModel)) {
      return res.status(400).json({ message: 'Loại nội dung không hợp lệ.' });
    }
    const comment = new Comment({ targetId, onModel,userId, content });
    await comment.save();

    // Tăng số lượng comment trong bài viết
    if (onModel === 'posts'){
      await Post.findByIdAndUpdate(targetId, { $inc: { commentsCount: 1 } });
    } 
    else await Reel.findByIdAndUpdate(targetId, { $inc: { commentsCount: 1 } });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Không thể tạo bình luận.', error });
  }
};

export const getCommentsByTarget = async (req, res) => {
  try {
    const { targetId, onModel } = req.query;
    if (!['posts', 'reels'].includes(onModel)) {
      return res.status(400).json({ message: 'Loại nội dung không hợp lệ.' });
    }
    const comments = await Comment.find({ targetId, onModel })
      .populate('userId', 'name avatar') // lấy thêm info người bình luận
      .sort({ createAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy danh sách bình luận.', error });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Bình luận không tồn tại.' });

    const isOwner = comment.userId.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền xoá bình luận này.' });
    }

    await Comment.findByIdAndDelete(req.params.id);

    // Giảm số lượng comment nếu là bài viết
    if (comment.onModel === 'posts') {
      await Post.findByIdAndUpdate(comment.targetId, { $inc: { commentsCount: -1 } });
    } else  await Reel.findByIdAndUpdate(comment.targetId, { $inc: { commentsCount: -1 } });
    
    res.status(200).json({ message: 'Đã xoá bình luận.' });
  } catch (error) {
    res.status(500).json({ message: 'Không thể xoá bình luận.', error });
  }
};

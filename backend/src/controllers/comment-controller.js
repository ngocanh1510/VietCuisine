import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

export const createComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const userId = req.user.id; // từ middleware xác thực

    const comment = new Comment({ postId, userId, content });
    await comment.save();

    // Tăng số lượng comment trong bài viết
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Không thể tạo bình luận.', error });
  }
};

export const getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
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

    // Giảm số lượng comment trong bài viết
    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });

    res.status(200).json({ message: 'Đã xoá bình luận.' });
  } catch (error) {
    res.status(500).json({ message: 'Không thể xoá bình luận.', error });
  }
};

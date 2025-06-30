import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Reel from '../models/Reel.js';

export const createComment = async (req, res) => {
  try {
    const { targetId, onModel, content, parentId } = req.body;
    console.log("Creating comment with data:", { targetId, onModel, content, parentId });
    const userId = req.user.id;

    if (!['posts', 'reels'].includes(onModel)) {
      return res.status(400).json({ message: 'Loại nội dung không hợp lệ.' });
    }

    const comment = new Comment({
      targetId,
      onModel,
      userId,
      content,
      parentId: parentId || null
    });
    console.log("Comment to be saved:", comment);

    await comment.save();

    const updateQuery = { $inc: { commentsCount: 1 } };
    if (onModel === 'posts') {
      await Post.findByIdAndUpdate(targetId, updateQuery);
    } else {
      await Reel.findByIdAndUpdate(targetId, updateQuery);
    }

    res.status(201).json({
      status: true,
      message: "Comment created",
      data: comment
    });

  } catch (error) {
    res.status(500).json({ message: 'Không thể tạo bình luận.', error });
  }
};

export const getCommentsByTarget = async (req, res) => {
  try {
    const { targetId, onModel } = req.query;

    // Lấy toàn bộ comment
    const comments = await Comment.find({ targetId, onModel })
      .populate('userId')
      .sort({ createAt: -1 });

    const roots = comments.filter(c => !c.parentId);
    const replies = comments.filter(c => c.parentId);

    const commentTree = roots.map(root => {
      const rootObj = root.toObject();
      rootObj.replies = replies
        .filter(r => r.parentId?.toString() === root._id.toString())
        .sort((a, b) => new Date(b.createAt) - new Date(a.createAt))
        .map(r => r.toObject());
      return rootObj;
    });


    res.status(200).json(commentTree);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: 'Không thể lấy bình luận.', error });
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

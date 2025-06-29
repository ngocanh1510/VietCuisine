import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Post from '../models/Post.js';

// Tạo bài viết
export const createPost = async (req, res) => {
  try {
    const { caption, recipeId  } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng tải lên hình ảnh.' });
    }
    const image = req.file?.path;

    const post = new Post({ userId, caption, image, recipeId  });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Không thể tạo bài viết.', error });
  }
};

// Lấy tất cả bài viết
export const getAllPosts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user?.id; // Lấy userId từ token đã xác thực
    const query = {};

    // Lọc theo ngày tạo
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const posts = await Post.find(query)
      .populate("userId")
      .populate("recipeId")
      .lean();

    // Đếm bình luận theo từng post
    for (const post of posts) {
      const comments = await Comment.find({ targetId: post._id, onModel: "posts" });
      post.comments = comments;
    }
    // Sau khi get danh sách bài viết
    for (let post of posts) {
      const liked = await Like.exists({
        userId,
        targetId: post._id,
        onModel: 'posts'
      });
      console.log(userId, post._id);
      console.log("Liked status for post:", post._id, "is", liked);
      post.isLiked = !!liked;
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài viết:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách bài viết", error });
  }
};

export const getPostById = async (req, res) => {
  try {
    // Lấy post và populate user + recipe
    const post = await Post.findById(req.params.id)
      .populate('userId')
      .populate('recipeId');

    if (!post) {
      return res.status(404).json({ message: 'Bài viết không tồn tại.' });
    }

    // Lấy các bình luận liên quan đến bài post này
    const comments = await Comment.find({
      targetId: req.params.id,
      onModel: 'posts'
    })
      .populate('userId')
      .sort({ createAt: -1 });
    console.log("Comments:", comments);
    res.status(200).json({
      ...post.toObject(),
      comments
    });

  } catch (error) {
    console.error("Lỗi khi lấy bài viết:", error);
    res.status(500).json({ message: 'Lỗi server khi lấy bài viết.', error });
  }
};



// Cập nhật bài viết
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Bài viết không tồn tại.' });

    // Kiểm tra người dùng có phải là chủ bài viết không
    if (post.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật bài viết này.' });
    }

    const { caption,recipeId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng tải lên hình ảnh.' });
    }
    
    const image = req.file?.path;
    post.caption = caption || post.caption;
    post.image = image || post.image;
    post.recipeId = recipeId || post.recipeId;
    const updatedPost = await post.save();

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Không thể cập nhật bài viết.', error });
  }
};


// Xoá bài viết
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Bài viết không tồn tại.' });
    
    // Kiểm tra người dùng có phải là chủ bài viết hoặc là admin
    const isOwner = post.userId.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền xoá bài viết này.' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Đã xoá bài viết thành công.' });
  } catch (error) {
    console.error("Lỗi khi xoá:", error);
    res.status(500).json({ message: 'Không thể xoá bài viết.', error: error.message });
  }

};

// Lấy tất cả bài viết của bản thân
export const getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id; 

    const posts = await Post.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy bài viết của bạn.', error: error.message });
  }
};
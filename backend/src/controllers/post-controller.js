import Post from '../models/Post.js';

// Tạo bài viết
export const createPost = async (req, res) => {
  try {
    const { caption, image } = req.body;
    const userId = req.user.id;
    const post = new Post({ userId, caption, image });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Không thể tạo bài viết.', error });
  }
};

// Lấy tất cả bài viết
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy bài viết.', error });
  }
};

// Lấy chi tiết một bài viết
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('userId');
    if (!post) return res.status(404).json({ message: 'Bài viết không tồn tại.' });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy bài viết.', error });
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

    const { caption, image } = req.body;
    post.caption = caption || post.caption;
    post.image = image || post.image;
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

    // Kiểm tra người dùng có phải là chủ bài viết không
    if (post.userId.toString() !== req.user.id.toString()) {
      console.log(post.userId.toString());
      console.log(req.user.id.toString());
      return res.status(403).json({ message: 'Bạn không có quyền xoá bài viết này.' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Đã xoá bài viết thành công.' });
  } catch (error) {
    console.error("Lỗi khi xoá:", error);
    res.status(500).json({ message: 'Không thể xoá bài viết.', error: error.message });
  }

};
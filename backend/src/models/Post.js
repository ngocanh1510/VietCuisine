import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    required: true
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updateAt' }
});

const Post = mongoose.model('posts', PostSchema);

export default Post;

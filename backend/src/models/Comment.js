import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'posts',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, {
  timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' }
});

const Comment = mongoose.model('comments', CommentSchema);

export default Comment;

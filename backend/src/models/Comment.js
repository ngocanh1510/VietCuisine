import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'onModel'  // dùng cho liên kết động nếu cần
    },

  onModel: {
    type: String,
    required: true,
    enum: ['posts','reels'] // có thể mở rộng nếu cần
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

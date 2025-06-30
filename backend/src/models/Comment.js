import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    required: true,
    enum: ['posts', 'reels']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'comments',
    default: null // nếu null thì là comment gốc
  }
}, {
  timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' }
});

const Comment = mongoose.model('comments', CommentSchema);

export default Comment;

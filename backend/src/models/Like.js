import mongoose from 'mongoose';

const LikeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'onModel'  // dùng cho liên kết động nếu cần
  },
  onModel: {
    type: String,
    required: true,
    enum: ['Post','Reel'] // có thể mở rộng nếu cần
  }
}, {
  timestamps: { createdAt: 'createAt', updatedAt: false }
});

const Like = mongoose.model('likes', LikeSchema);

export default Like;

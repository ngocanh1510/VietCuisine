import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Tạo chỉ mục giúp truy vấn hiệu quả hơn
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });

export default mongoose.model('messages', MessageSchema);

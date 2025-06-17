import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Types.ObjectId, ref: "users", required: true }, // Người nhận thông báo
    sender: { type: mongoose.Types.ObjectId, ref: "users", required: true }, // Người thực hiện hành động
    type: { type: String, enum: ["like", "comment", "save"], required: true }, // Loại thông báo
    recipe: { type: mongoose.Types.ObjectId, ref: "recipesses", required: true }, // Recipe liên quan
    message: { type: String, required: true }, // Nội dung thông báo
    isRead: { type: Boolean, default: false }, // Trạng thái đã đọc
    createdAt: { type: Date, default: Date.now }
});

const NotificationModel = mongoose.model("notifications", NotificationSchema);
export default NotificationModel;

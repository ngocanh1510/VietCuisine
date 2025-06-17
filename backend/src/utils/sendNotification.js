import NotificationModel from "../models/Notification.js";

const sendNotification = async ({ recipient, sender, type, recipeId, message }) => {
    try {
        const notification = new NotificationModel({
            recipient,
            sender,
            type,
            recipe: recipeId,
            message
        });

        await notification.save();
        //console.log(`Thông báo được gửi đến ${recipient}: ${message}`);
    } catch (err) {
        console.error("Lỗi khi gửi thông báo:", err.message);
    }
};

export default sendNotification;
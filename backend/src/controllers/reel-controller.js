import Like from "../models/Like.js";
import ReelModel from "../models/Reel.js";
import mongoose from "mongoose";

export const getAllReel = async (req, res, next) => {
  try {
    const userId = req.user?.id; 

    let reels = await ReelModel.find().sort({ createdAt: -1 }).lean();

    if (!reels) {
      return res.status(500).json({ message: "Request Failed" });
    }

    // Gắn thuộc tính liked vào từng reel
    for (let reel of reels) {
      const liked = await Like.exists({
        userId,
        targetId: reel._id,
        onModel: 'reels'
      });
      reel.isLiked = !!liked;
    }

    return res.status(200).json({ reels });

  } catch (err) {
    console.error("Error in getAllReel:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const addReel = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const video = req.file?.path;
    const caption = String(req.body.caption || "");
    console.log("đã vào hàm thêm reel", userId, video, caption);

    if (!userId || !video || caption.trim() === "") {
      return res.status(422).json({ message: "Invalid input" });
    }

    const reel = new ReelModel({
      userOwner: userId,
      caption: caption.trim(),
      video: video
    });

    await reel.save();

    return res.status(201).json({ message: "Reel added successfully", reel });
  } catch (err) {
    console.error("Lỗi khi thêm reel:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateReel = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const video = req.file?.path;
    const caption = String(req.body.caption || "");
    const { id } = req.params;

    if (!userId || caption.trim() === "") {
      return res.status(422).json({ message: "Invalid input" });
    }

    const existingReel = await ReelModel.findById(id);
    if (!existingReel) {
      return res.status(404).json({
        status: false,
        message: 'Reel not found'
      });
    }

    if (!existingReel.userOwner.equals(userId)) {
    return res.status(400).json({
      status: false,
      message: 'Unauthorized'
    });
    }

    // Kiểm tra thời gian tạo và giới hạn 1 tiếng
    const now = new Date();
    const createdAt = new Date(existingReel.createdAt);
    const diffInMs = now - createdAt;
    const oneHourInMs = 60 * 60 * 1000;

    if (diffInMs > oneHourInMs) {
      return res.status(403).json({
        status: false,
        message: "Edit timeout"
      });
    }

    const updateFields = {};
    if (caption) updateFields.caption = caption;
    if (video) updateFields.video = video;

    const updatedReel = await ReelModel.findByIdAndUpdate(id, updateFields, { new: true });

    return res.status(200).json({
      status: true,
      message: 'Reel updated successfully',
      data: updatedReel
    });
  } catch (err) {
    console.error("Lỗi khi cập nhật reel:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteReel = async (req, res) => {
  try {
    const { id } = req.params; 
    const userId = req.user?.id;
    

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid reel ID'
      });
    }

    const existingReel = await ReelModel.findById(id);
    if (!existingReel) {
      return res.status(404).json({
        status: false,
        message: 'Reel not found'
      });
    }
    if (!existingReel.userOwner.equals(userId)) {
    return res.status(400).json({
      status: false,
      message: 'Unauthorized'
    });
    }

    await ReelModel.findByIdAndDelete(id);

    return res.status(200).json({
      status: true,
      message: 'Reel deleted successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Failed to delete reel',
      error: error.message
    });
  }
};

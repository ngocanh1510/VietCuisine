import Message from '../models/Message.js';
import mongoose from 'mongoose';
import User from '../models/User.js';

export const getConversations = async (req, res) => {
  try {
    const userId = req.params.userId;
    const authUserId = req.user.id.toString();

    if (authUserId !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền xem cuộc trò chuyện này.' });
    }

    // ✅ Dùng aggregation để lấy người đã trò chuyện và tin nhắn gần nhất
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $project: {
          otherUser: {
            $cond: [
              { $eq: ['$senderId', new mongoose.Types.ObjectId(userId)] },
              '$receiverId',
              '$senderId'
            ]
          },
          text: 1,
          createdAt: 1
        }
      },
      {
        $sort: { createdAt: -1 } // sắp xếp để lấy tin nhắn mới nhất
      },
      {
        $group: {
          _id: '$otherUser',
          lastMessage: { $first: '$text' },
          lastTime: { $first: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          userId: '$_id',
          name: '$userInfo.name',
          avatar: '$userInfo.avatar',
          lastMessage: 1,
          lastTime: 1
        }
      },
      {
        $sort: { lastTime: -1 }
      }
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Lỗi getConversations:', error);
    res.status(500).json({ message: 'Lỗi lấy danh sách trò chuyện', error });
  }
};

export const getMessagesBetweenUsers = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const authUserId = req.user.id.toString(); 

     // Chỉ cho phép người có liên quan xem tin nhắn
    if (authUserId !== userId1 && authUserId !== userId2) {
      return res.status(403).json({ message: 'Bạn không có quyền xem cuộc trò chuyện này.' });
    }

    // Phân trang
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ]
    }).sort({ createdAt: 1 }) // Sắp xếp theo thời gian tăng dần
    .skip(skip)
    .limit(limit);

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy tin nhắn giữa hai người.', error });
  }
};
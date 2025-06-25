import IngredientOrder from '../models/IngredientOrder.js';
import UserModel from '../models/User.js';
import IngredientModel from '../models/Ingredient.js';
import mongoose from 'mongoose';

const getStartOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

export const getDailyRevenue = async (req, res) => {
  try {
    const today = getStartOfToday();
    const orders = await IngredientOrder.aggregate([
      { $match: { orderedAt: { $gte: today }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ]);
    console.log(orders);
    res.json(orders[0]?.total || 0);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get daily revenue' });
  }
};

export const getNewUsers = async (req, res) => {
  try {
    const today = getStartOfToday();
    const count = await UserModel.countDocuments({ createdAt: { $gte: today } });
    res.json(count);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get new users' });
  }
};

export const getDailyOrders = async (req, res) => {
  try {
    const today = getStartOfToday();
    const count = await IngredientOrder.countDocuments({ orderedAt: { $gte: today } });
    res.json(count);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get daily orders' });
  }
};

export const getMonthlyRevenue = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const orders = await IngredientOrder.aggregate([
      { $match: { orderedAt: { $gte: startOfMonth }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ]);
    res.json(orders[0]?.total || 0);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get monthly revenue' });
  }
};

export const getRevenueByMonth = async (req, res) => {
  try {
    const orders = await IngredientOrder.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { month: { $month: '$orderedAt' } },
          total: { $sum: '$totalCost' }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);
    const formatted = orders.map((o) => ({ month: o._id.month.toString(), value: o.total }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get revenue by month' });
  }
};

export const getTopIngredients = async (req, res) => {
  try {
    const top = await IngredientOrder.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.ingredient',
          totalSold: { $sum: '$items.quantity' }
        }
      },
      {
        $lookup: {
          from: 'ingredients',
          localField: '_id',
          foreignField: '_id',
          as: 'ingredient'
        }
      },
      { $unwind: '$ingredient' },
      {
        $project: {
          _id: 0,
          name: '$ingredient.name',
          quantity: '$totalSold'
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 }
    ]);
    res.json(top);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get top ingredients' });
  }
};

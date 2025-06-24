import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    unique: true
  },
  items: [
    {
      ingredient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ingredient',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Cart = mongoose.model('cart', CartSchema);
export default Cart;
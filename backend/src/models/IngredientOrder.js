import mongoose from 'mongoose';

const IngredientOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', 
    required: true
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
      },
      unitPriceAtTime: {  
        type: Number,
        required: true
      }
    }
  ],
  totalCost: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  
   paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'bank_transfer'],
    default: 'cash'
  },

  shippingAddress: {
    recipientName: String,
    phone: String,
    address: String,
  },
  deliveryStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  orderedAt: {
    type: Date,
    default: Date.now
  }
});

const IngredientOrder = mongoose.model('ingredient_orders', IngredientOrderSchema);
export default IngredientOrder;

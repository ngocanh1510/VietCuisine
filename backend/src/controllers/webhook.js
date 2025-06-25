import IngredientOrder from "../models/IngredientOrder.js";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const orderId = session.metadata?.orderId;
    const discountAmount = session.total_details?.amount_discount || 0;
    if (!orderId) {
      console.warn("Missing metadata orderId.");
      return res.status(200).json({ received: true });
    }


    try {
      // Cập nhật trạng thái đã thanh toán
      await IngredientOrder.findByIdAndUpdate(orderId, { paymentStatus: "paid", discount: discountAmount });
      
      console.log(`Order ${orderId} đã thanh toán.`);
    } catch (err) {
      console.error(`Lỗi khi cập nhật dữ liệu order ${orderId}:`, err.message);
    }
  }

  res.status(200).json({ received: true });
};

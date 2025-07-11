import IngredientModel from '../models/Ingredient.js'; 
import IngredientOrder from '../models/IngredientOrder.js';
import Cart from '../models/Cart.js';
import Stripe from "stripe";

export const orderIngredients = async (req, res) => {
  try {
    const { orders, shippingAddress, paymentMethod  } = req.body; // [{ ingredientId, quantity }]
    const userId = req.user.id; // Lấy userId từ token
    const orderedItems = [];
    let totalCost = 0;
    console.log("Received orders:", orders);
    console.log("Received shippingAddress:", shippingAddress);
    console.log("Received paymentMethod:", paymentMethod);
    console.log("User ID:", userId);

    const detailedItems = []; // dùng để trả về chi tiết

    if (!shippingAddress?.recipientName || !shippingAddress?.phone || !shippingAddress?.address) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin giao hàng (tên, số điện thoại, địa chỉ).' });
    }

    for (const item of orders) {
      const ingredient = await IngredientModel.findById(item.ingredientId);

      if (!ingredient) {
        return res.status(404).json({ message: `Không tìm thấy nguyên liệu: ${item.ingredientId}` });
      }

      if (ingredient.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Không đủ ${ingredient.name} trong kho. Còn lại: ${ingredient.stock}` 
        });
      }

      ingredient.stock -= item.quantity;
      await ingredient.save();

      orderedItems.push({
        ingredient: ingredient._id,
        quantity: item.quantity,
        unitPriceAtTime: ingredient.unitPrice
      });

      totalCost += ingredient.unitPrice * item.quantity;

      // Thêm vào danh sách trả về
      detailedItems.push({
        name: ingredient.name,
        quantity: item.quantity,
        unit: ingredient.unit,
        pricePerUnit: ingredient.unitPrice,
        image: ingredient.imageUrl,
        subtotal: ingredient.unitPrice * item.quantity
      });
    }

    const newOrder = new IngredientOrder({
      userId,
      items: orderedItems,
      totalCost,
      paymentMethod,
      shippingAddress
    });

    await newOrder.save();

    res.status(201).json({
      message: 'Đặt nguyên liệu thành công.',
      orderId: newOrder._id,
      totalCost,
      items: detailedItems,
      shippingAddress,
      paymemtStatus: newOrder.paymentStatus,
      paymentMethod: newOrder.paymentMethod
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đặt nguyên liệu.', error: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await IngredientOrder.find({ userId })
      .populate('items.ingredient', 'name unit');

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy đơn hàng của bạn.', error: error.message });
  }
};
// export const getShippingOrders = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // Lấy các đơn hàng đang "shipping"
//     const orders = await IngredientOrder.find({ 
//       userId, 
//       deliveryStatus: 'shipping' 
//     })
//     .populate('items.ingredient', 'name unit imageUrl category')  // lấy thông tin nguyên liệu
//     .sort({ orderedAt: -1 }); // mới nhất trước

//     if (orders.length === 0) {
//       return res.status(200).json({ message: 'Không có đơn hàng đang giao.', orders: [] });
//     }

//     // Format kết quả
//     const result = orders.map(order => {
//       const items = order.items.map(item => ({
//         ingredientId: item.ingredient._id,
//         name: item.ingredient.name,
//         unit: item.ingredient.unit,
//         imageUrl: item.ingredient.imageUrl,
//         category: item.ingredient.category,
//         quantity: item.quantity,
//         unitPrice: item.unitPriceAtTime,
//         subtotal: item.quantity * item.unitPriceAtTime
//       }));

//       return {
//         orderId: order._id,
//         items,
//         totalCost: order.totalCost,
//         discount: order.discount,
//         shippingAddress: order.shippingAddress,
//         orderedAt: order.orderedAt,
//         deliveryStatus: order.deliveryStatus
//       };
//     });

//     res.status(200).json({ orders: result });

//   } catch (error) {
//     console.error('Error fetching shipping orders:', error);
//     res.status(500).json({ message: 'Lỗi khi lấy đơn hàng đang giao.', error: error.message });
//   }
// };
export const getOrdersByStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const status = req.params.status || 'shipping'; 
    console.log("Fetching orders for user:", userId, "with status:", status);

    // Lấy các đơn hàng đang "delivered"
    const orders = await IngredientOrder.find({ 
      userId, 
      deliveryStatus: status  
    })
    .populate('items.ingredient')  // lấy thông tin nguyên liệu
    .sort({ orderedAt: -1 }); // mới nhất trước

    if (orders.length === 0) {
      return res.status(200).json({ message: 'Không có đơn hàng đang giao.', orders: [] });
    }

    // Format kết quả
    const result = orders.map(order => {
      const items = order.items.map(item => ({
        ingredientId: item.ingredient._id,
        name: item.ingredient.name,
        unit: item.ingredient.unit,
        imageUrl: item.ingredient.imageUrl,
        category: item.ingredient.category,
        quantity: item.quantity,
        unitPrice: item.unitPriceAtTime,
        subtotal: item.quantity * item.unitPriceAtTime,
        paymentStatus: item.paymentStatus
      }));

      return {
        orderId: order._id,
        items,
        totalCost: order.totalCost,
        discount: order.discount,
        shippingAddress: order.shippingAddress,
        orderedAt: order.orderedAt,
        deliveryStatus: order.deliveryStatus,
        paymentStatus: order.paymentStatus
      };
    });

    res.status(200).json({ orders: result });

  } catch (error) {
    console.error('Error fetching shipping orders:', error);
    res.status(500).json({ message: 'Lỗi khi lấy đơn hàng đang giao.', error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {

    const orders = await IngredientOrder.find()
      .populate('userId') 
      .populate('items.ingredient', 'name unit')
      .sort({ orderedAt: -1 }); // Lấy thông tin nguyên liệu

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng.', error: error.message });
  }
};

const stripe = new Stripe ( process.env.STRIPE_SECRET_KEY);

export const payment = async (req, res) => {
  try {
    console.log("Received payment request:", req.body);
    const orderId = req.body.orderId;
    const couponCode = req.body.couponCode; // Mã giảm giá nếu có

    if (!orderId) {
      return res.status(400).json({ error: "Thiếu orderId" });
    }

    const order = await IngredientOrder.findById(orderId).lean();
    if (!order || !Array.isArray(order.items) || order.items.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng hoặc đơn hàng rỗng" });
    }

    const ingredientIds = order.items.map(item => item.ingredient);
    const ingredients = await IngredientModel.find({ _id: { $in: ingredientIds } });

    const lineItems = order.items.map((item) => {
      const ingredient = ingredients.find(ing => ing._id.toString() === item.ingredient.toString());

      if (!ingredient) {
        throw new Error(`Nguyên liệu ${item.ingredient} không tồn tại`);
      }

      return {
        price_data: {
          currency: 'VND',
          unit_amount: ingredient.unitPrice, 
          product_data: {
            name: ingredient.name,
            images: [ingredient.imageUrl],
            description: ingredient.unit
          },
        },
        quantity: item.quantity
      };
    });

    let discounts = [];
    if (couponCode) {
      const promotionCodes = await stripe.promotionCodes.list({
        code: couponCode,
        active: true,
        limit: 1,
      });

      if (promotionCodes.data.length > 0) {
        discounts.push({ promotion_code: promotionCodes.data[0].id });
      } else {
        return res.status(400).json({ error: 'Mã giảm giá không hợp lệ' });
      }
    }

    // 6. Tạo session thanh toán
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      locale: 'vi',
      discounts,
      success_url: `vietcuisine://payment-success?orderId=${orderId}`,
      cancel_url: `vietcuisine://payment-cancel`,
      metadata: { orderId },
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error("Lỗi khi tạo session thanh toán:", error);
    res.status(500).send('Lỗi khi tạo session thanh toán');
  }
};

// Lấy thông tin đơn hàng theo ID
export const getOrderById = async(req, res, next) =>{
  try{
    const order = await IngredientOrder.findById(req.params.id)
    .populate('userId') 
    .populate('items.ingredient', 'name unit');

    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    res.json(order);
  }
  catch(error){
    res.status(500).json({error:error});
  }

}

export const orderFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ingredientIds, shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress?.recipientName || !shippingAddress?.phone || !shippingAddress?.address) {
      return res.status(400).json({ message: 'Thiếu thông tin giao hàng.' });
    }

    const cart = await Cart.findOne({ userId }).populate('items.ingredient');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống.' });
    }

    // Lọc item theo ingredientIds nếu được truyền
    let itemsToOrder = cart.items;
    if (Array.isArray(ingredientIds) && ingredientIds.length > 0) {
      itemsToOrder = cart.items.filter(item =>
        ingredientIds.includes(item.ingredient._id.toString())
      );

      if (itemsToOrder.length === 0) {
        return res.status(400).json({ message: 'Không tìm thấy nguyên liệu phù hợp trong giỏ hàng.' });
      }
    }

    const orderedItems = [];
    let totalCost = 0;
    const detailedItems = [];

    for (const item of itemsToOrder) {
      const ingredient = item.ingredient;

      if (ingredient.stock < item.quantity) {
        return res.status(400).json({
          message: `Không đủ ${ingredient.name} trong kho. Còn lại: ${ingredient.stock}`
        });
      }

      ingredient.stock -= item.quantity;
      await ingredient.save();

      orderedItems.push({
        ingredient: ingredient._id,
        quantity: item.quantity,
        unitPriceAtTime: ingredient.unitPrice
      });

      totalCost += ingredient.unitPrice * item.quantity;

      detailedItems.push({
        name: ingredient.name,
        quantity: item.quantity,
        unit: ingredient.unit,
        pricePerUnit: ingredient.unitPrice,
        image: ingredient.imageUrl,
        subtotal: ingredient.unitPrice * item.quantity
      });
    }

    const newOrder = new IngredientOrder({
      userId,
      items: orderedItems,
      totalCost,
      paymentMethod,
      shippingAddress
    });

    await newOrder.save();

    // Cập nhật lại giỏ hàng: xoá các item đã đặt
    cart.items = cart.items.filter(item =>
      !itemsToOrder.some(ordered => ordered.ingredient._id.equals(item.ingredient._id))
    );
    await cart.save();

    res.status(201).json({
      message: 'Đặt hàng từ giỏ thành công.',
      orderId: newOrder._id,
      totalCost,
      items: detailedItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: newOrder.paymentStatus
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đặt hàng từ giỏ.', error: error.message });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = req.body.status;
    console.log("Updating delivery status for order:", id, "to", status);
  const allowedStatuses = ['shipping', 'delivered', 'cancelled'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
  }
    const updatedOrder = await IngredientOrder.findByIdAndUpdate(id,
      { deliveryStatus: status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    res.json({
      message: 'Cập nhật trạng thái đơn hàng thành công.',
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi cập nhật đơn hàng.', error });
  }
}

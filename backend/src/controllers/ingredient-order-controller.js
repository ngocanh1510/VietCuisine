import Ingredient from '../models/Ingredient.js'; 
import IngredientOrder from '../models/IngredientOrder.js';

export const orderIngredients = async (req, res) => {
  try {
    const { orders, shippingAddress, paymentMethod  } = req.body; // [{ ingredientId, quantity }]
    const userId = req.user.id; // Lấy userId từ token
    const orderedItems = [];
    let totalCost = 0;

    const detailedItems = []; // dùng để trả về chi tiết

    if (!shippingAddress?.recipientName || !shippingAddress?.phone || !shippingAddress?.address) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin giao hàng (tên, số điện thoại, địa chỉ).' });
    }

    for (const item of orders) {
      const ingredient = await Ingredient.findById(item.ingredientId);

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

import Cart from '../models/Cart.js';
import Ingredient from '../models/Ingredient.js';

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Danh sách items là bắt buộc.' });
    }

    const cart = await Cart.findOne({ userId }) || new Cart({ userId, items: [] });

    for (const { ingredientId, quantity } of items) {
      if (!ingredientId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: `Thông tin item không hợp lệ.` });
      }

      const ingredient = await Ingredient.findById(ingredientId);
      if (!ingredient) {
        return res.status(404).json({ message: `Không tìm thấy nguyên liệu ${ingredientId}` });
      }

      const existingItem = cart.items.find(item => item.ingredient.toString() === ingredientId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ ingredient: ingredientId, quantity });
      }
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json({ message: 'Đã thêm các item vào giỏ hàng.', cart });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm vào giỏ hàng.', error: error.message });
  }
};
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId })
      .populate('items.ingredient', 'name unit unitPrice imageUrl category');

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ message: 'Giỏ hàng trống.', items: [] });
    }

    const cartItems = cart.items.map(item => ({
      ingredientId: item.ingredient._id,
      name: item.ingredient.name,
      unit: item.ingredient.unit,
      unitPrice: item.ingredient.unitPrice,
      imageUrl: item.ingredient.imageUrl,
      quantity: item.quantity,
      category: item.ingredient.category,
      subtotal: item.quantity * item.ingredient.unitPrice
    }));

    const totalCost = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.status(200).json({
      items: cartItems,
      totalCost,
      updatedAt: cart.updatedAt
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng.', error: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ingredientId, quantity } = req.body;

    if (!ingredientId || typeof quantity !== 'number') {
      return res.status(400).json({ message: 'Thiếu ingredientId hoặc quantity không hợp lệ.' });
    }

    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      return res.status(404).json({ message: 'Không tìm thấy nguyên liệu.' });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      if (quantity <= 0) {
        return res.status(400).json({ message: 'Số lượng phải lớn hơn 0 để thêm vào giỏ hàng.' });
      }

      cart = new Cart({
        userId,
        items: [{ ingredient: ingredientId, quantity }],
        updatedAt: Date.now()
      });

      await cart.save();
      return res.status(201).json({ message: 'Đã tạo giỏ hàng và thêm nguyên liệu.' });
    }

    const itemIndex = cart.items.findIndex(item => item.ingredient.toString() === ingredientId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1); // remove item
      } else {
        cart.items[itemIndex].quantity = quantity; // update quantity
      }
    } else {
      if (quantity <= 0) {
        return res.status(400).json({ message: 'Số lượng phải lớn hơn 0 để thêm vào giỏ hàng.' });
      }
      cart.items.push({ ingredient: ingredientId, quantity }); // add new item
    }

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: 'Giỏ hàng đã được cập nhật.' });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật giỏ hàng.', error: error.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ingredientId } = req.params;

    if (!ingredientId) {
      return res.status(400).json({ message: 'Thiếu ingredientId.' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng.' });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item.ingredient.toString() !== ingredientId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: 'Nguyên liệu không tồn tại trong giỏ hàng.' });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: 'Đã xoá nguyên liệu khỏi giỏ hàng.' });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xoá nguyên liệu khỏi giỏ hàng.', error: error.message });
  }
};
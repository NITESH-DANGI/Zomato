"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.decrementCartItem = exports.incrementCartItem = exports.fetchMyCart = exports.addToCart = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const trycatch_js_1 = __importDefault(require("../middleware/trycatch.js"));
const Cart_js_1 = __importDefault(require("../models/Cart.js"));
exports.addToCart = (0, trycatch_js_1.default)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please Login",
        });
    }
    const userId = req.user._id;
    const { restaurantId, itemId } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(restaurantId) ||
        !mongoose_1.default.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({
            message: "Invalid restaurant and item id",
        });
    }
    const cartFromDifferentRestaurant = await Cart_js_1.default.findOne({
        userId,
        restaurantId: { $ne: restaurantId },
    });
    if (cartFromDifferentRestaurant) {
        return res.status(400).json({
            message: "You can order from only one restaurant at a time. Please clear your cart first to add items from this restaurant.",
        });
    }
    const cartItem = await Cart_js_1.default.findOneAndUpdate({ userId, restaurantId, itemId }, {
        $inc: { quauntity: 1 },
        $setOnInsert: { userId, restaurantId, itemId },
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
    return res.json({
        message: "Item added to cart",
        cart: cartItem,
    });
});
exports.fetchMyCart = (0, trycatch_js_1.default)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please Login",
        });
    }
    const userId = req.user._id;
    const cartItems = await Cart_js_1.default.find({ userId })
        .populate("itemId")
        .populate("restaurantId");
    let subtotal = 0;
    let cartLength = 0;
    for (const cartItem of cartItems) {
        const item = cartItem.itemId;
        subtotal += item.price * cartItem.quauntity;
        cartLength += cartItem.quauntity;
    }
    return res.json({
        success: true,
        cartLength,
        subtotal,
        cart: cartItems,
    });
});
exports.incrementCartItem = (0, trycatch_js_1.default)(async (req, res) => {
    const userId = req.user?._id;
    const { itemId } = req.body;
    if (!userId || !itemId) {
        return res.status(400).json({
            message: "Invalid request",
        });
    }
    const cartItem = await Cart_js_1.default.findOneAndUpdate({ userId, itemId }, { $inc: { quauntity: 1 } }, { new: true });
    if (!cartItem) {
        return res.status(404).json({
            message: "Item not found",
        });
    }
    res.json({
        message: "Quantity increased",
        cartItem,
    });
});
exports.decrementCartItem = (0, trycatch_js_1.default)(async (req, res) => {
    const userId = req.user?._id;
    const { itemId } = req.body;
    if (!userId || !itemId) {
        return res.status(400).json({
            message: "Invalid request",
        });
    }
    const cartItem = await Cart_js_1.default.findOne({ userId, itemId });
    if (!cartItem) {
        return res.status(404).json({
            message: "Item not found",
        });
    }
    if (cartItem.quauntity === 1) {
        await Cart_js_1.default.deleteOne({ userId, itemId });
        return res.json({
            message: "Item removed from cart",
        });
    }
    cartItem.quauntity -= 1;
    await cartItem.save();
    res.json({
        message: "Quantity decreased",
        cartItem,
    });
});
exports.clearCart = (0, trycatch_js_1.default)(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    await Cart_js_1.default.deleteMany({ userId });
    res.json({
        message: "Cart cleared successfully",
    });
});

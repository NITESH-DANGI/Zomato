"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusRider = exports.getCurrentOrderForRider = exports.assignRiderToOrder = exports.fetchSingleOrder = exports.getMyOrders = exports.updateOrderStatus = exports.fetchRestaurantOrders = exports.fetchOrderForPayment = exports.createOrder = void 0;
const axios_1 = __importDefault(require("axios"));
const trycatch_js_1 = __importDefault(require("../middleware/trycatch.js"));
const Address_js_1 = __importDefault(require("../models/Address.js"));
const Cart_js_1 = __importDefault(require("../models/Cart.js"));
const Order_js_1 = __importDefault(require("../models/Order.js"));
const Restaurant_js_1 = __importDefault(require("../models/Restaurant.js"));
const order_publisher_js_1 = require("../config/order.publisher.js");
exports.createOrder = (0, trycatch_js_1.default)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const { paymentMethod, addressId } = req.body;
    if (!addressId) {
        return res.status(400).json({
            message: "Address is required",
        });
    }
    const address = await Address_js_1.default.findOne({
        _id: addressId,
        userId: user._id,
    });
    if (!address) {
        return res.status(404).json({
            message: "Address Not found",
        });
    }
    const getDistanceKm = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return +(R * c).toFixed(2);
    };
    const cartItems = await Cart_js_1.default.find({ userId: user._id })
        .populate("itemId")
        .populate("restaurantId");
    if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
    }
    const firstCartItem = cartItems[0];
    if (!firstCartItem || !firstCartItem.restaurantId) {
        return res.status(400).json({
            message: "Invailid Cart Data",
        });
    }
    const restaurantId = firstCartItem.restaurantId._id;
    const restaurant = await Restaurant_js_1.default.findById(restaurantId);
    if (!restaurant) {
        return res.status(404).json({
            message: "No restaurant with this id",
        });
    }
    if (!restaurant.isOpen) {
        return res.status(404).json({
            message: "Sorry this restaurant is closed for now",
        });
    }
    const distance = getDistanceKm(address.location.coordinates[1], address.location.coordinates[0], restaurant.autoLocation.coordinates[1], restaurant.autoLocation.coordinates[0]);
    let subtotal = 0;
    const orderItems = cartItems.map((cart) => {
        const item = cart.itemId;
        if (!item) {
            throw new Error("Invalid cart item");
        }
        const itemTotal = item.price * cart.quauntity;
        subtotal += itemTotal;
        return {
            itemId: item._id.toString(),
            name: item.name,
            price: item.price,
            quauntity: cart.quauntity,
        };
    });
    const deliveryFee = subtotal < 250 ? 49 : 0;
    const platfromFee = 7;
    const totalAmount = subtotal + deliveryFee + platfromFee;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const [longitude, latitude] = address.location.coordinates;
    const riderAmount = Math.ceil(distance) * 17;
    const order = await Order_js_1.default.create({
        userId: user._id.toString(),
        restaurantId: restaurantId.toString(),
        restaurantName: restaurant.name,
        riderId: null,
        distance,
        riderAmount,
        items: orderItems,
        subtotal,
        deliveryFee,
        platfromFee,
        totalAmount,
        addressId: address._id.toString(),
        deliveryAddress: {
            fromattedAddress: address.formattedAddress,
            mobile: address.mobile,
            latitude,
            longitude,
        },
        paymentMethod,
        paymentStatus: "pending",
        status: "placed",
        expiresAt,
    });
    await Cart_js_1.default.deleteMany({ userId: user._id });
    res.json({
        message: "Order created successfully",
        orderId: order._id.toString(),
        amount: totalAmount,
    });
});
exports.fetchOrderForPayment = (0, trycatch_js_1.default)(async (req, res) => {
    if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
        return res.status(403).json({
            message: "Forbidden",
        });
    }
    const order = await Order_js_1.default.findById(req.params.id);
    if (!order) {
        return res.status(404).json({
            message: "Order not found",
        });
    }
    if (order.paymentStatus !== "pending") {
        return res.status(400).json({
            message: "Order already paid",
        });
    }
    res.json({
        orderId: order._id,
        amount: order.totalAmount,
        currency: "INR",
    });
});
exports.fetchRestaurantOrders = (0, trycatch_js_1.default)(async (req, res) => {
    const user = req.user;
    const { restaurantId } = req.params;
    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    if (!restaurantId) {
        return res.status(400).json({
            message: "Restaurant id is required",
        });
    }
    const limit = req.query.limit ? Number(req.query.limit) : 0;
    const orders = await Order_js_1.default.find({
        restaurantId,
        paymentStatus: "paid",
    })
        .sort({ createdAt: -1 })
        .limit(limit);
    return res.json({
        success: true,
        count: orders.length,
        orders,
    });
});
const ALLOWED_STATUSES = ["accepted", "preparing", "ready_for_rider"];
exports.updateOrderStatus = (0, trycatch_js_1.default)(async (req, res) => {
    const user = req.user;
    const { orderId } = req.params;
    const { status } = req.body;
    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
            message: "Invalid order status",
        });
    }
    const order = await Order_js_1.default.findById(orderId);
    if (!order) {
        return res.status(404).json({
            message: "Order not found",
        });
    }
    if (order.paymentStatus !== "paid") {
        return res.status(404).json({
            message: "Order not completed",
        });
    }
    const restaurant = await Restaurant_js_1.default.findById(order.restaurantId);
    if (!restaurant) {
        return res.status(404).json({
            message: "Restaurant not found",
        });
    }
    if (restaurant.ownerId !== user._id.toString()) {
        return res.status(401).json({
            message: "You are not allowed to update this order",
        });
    }
    order.status = status;
    await order.save();
    await axios_1.default.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
        event: "order:update",
        room: `user:${order.userId}`,
        payload: {
            orderId: order._id,
            status: order.status,
        },
    }, {
        headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
    });
    // now assign riders
    if (status === "ready_for_rider") {
        console.log("Publishing Order ready for rider event for order", order._id);
        await (0, order_publisher_js_1.publishEvent)("ORDER_READY_FOR_RIDER", {
            orderId: order._id.toString(),
            restaurantId: restaurant._id.toString(),
            location: restaurant.autoLocation,
        });
        console.log("Event Published successfully");
    }
    res.json({
        message: "order status updated successfully",
        order,
    });
});
exports.getMyOrders = (0, trycatch_js_1.default)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const orders = await Order_js_1.default.find({
        userId: req.user._id.toString(),
        paymentStatus: "paid",
    }).sort({ createdAt: -1 });
    res.json({ orders });
});
exports.fetchSingleOrder = (0, trycatch_js_1.default)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const order = await Order_js_1.default.findById(req.params.id);
    if (!order) {
        return res.status(404).json({
            message: "Order not found",
        });
    }
    if (order.userId !== req.user._id.toString()) {
        return res.status(401).json({
            message: "You are not allowed to view this order",
        });
    }
    res.json(order);
});
exports.assignRiderToOrder = (0, trycatch_js_1.default)(async (req, res) => {
    if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
        return res.status(403).json({
            message: "Forbidden",
        });
    }
    const { orderId, riderId, riderName, riderPhone } = req.body;
    const orderAvailable = await Order_js_1.default.findOne({
        riderId,
        status: { $ne: "delivered" },
    });
    if (orderAvailable) {
        return res.status(400).json({
            message: "You already have an order",
        });
    }
    const order = await Order_js_1.default.findById(orderId);
    if (order?.riderId !== null) {
        return res.status(400).json({
            message: "Order Already taken",
        });
    }
    const orderUpdated = await Order_js_1.default.findOneAndUpdate({ _id: orderId, riderId: null }, {
        riderId,
        riderName,
        riderPhone,
        status: "rider_assigned",
    }, { new: true });
    await axios_1.default.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
        event: "order:rider_assigned",
        room: `user:${order.userId}`,
        payload: order,
    }, {
        headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
    });
    await axios_1.default.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
        event: "order:rider_assigned",
        room: `restaurant:${order.restaurantId}`,
        payload: order,
    }, {
        headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
    });
    res.json({
        message: "Rider Assigned Successfully",
        success: true,
        order: orderUpdated,
    });
});
exports.getCurrentOrderForRider = (0, trycatch_js_1.default)(async (req, res) => {
    if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
        return res.status(403).json({
            message: "Forbidden",
        });
    }
    const { riderId } = req.query;
    if (!riderId) {
        return res.status(400).json({
            message: "Rider id is required",
        });
    }
    const order = await Order_js_1.default.findOne({
        riderId,
        status: { $ne: "delivered" },
    }).populate("restaurantId");
    if (!order) {
        return res.status(404).json({
            message: "Order not found",
        });
    }
    res.json(order);
});
exports.updateOrderStatusRider = (0, trycatch_js_1.default)(async (req, res) => {
    if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
        return res.status(403).json({
            message: "Forbidden",
        });
    }
    const { orderId } = req.body;
    const order = await Order_js_1.default.findById(orderId);
    if (!order) {
        return res.status(404).json({
            message: "Order not found",
        });
    }
    if (order.status === "rider_assigned") {
        order.status = "picked_up";
        await order.save();
        await axios_1.default.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
            event: "order:rider_assigned",
            room: `restaurant:${order.restaurantId}`,
            payload: order,
        }, {
            headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
            },
        });
        await axios_1.default.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
            event: "order:rider_assigned",
            room: `user:${order.userId}`,
            payload: order,
        }, {
            headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
            },
        });
        return res.json({
            message: "Order updated Successfully",
        });
    }
    if (order.status === "picked_up") {
        order.status = "delivered";
        await order.save();
        await axios_1.default.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
            event: "order:rider_assigned",
            room: `restaurant:${order.restaurantId}`,
            payload: order,
        }, {
            headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
            },
        });
        await axios_1.default.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
            event: "order:rider_assigned",
            room: `user:${order.userId}`,
            payload: order,
        }, {
            headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
            },
        });
        return res.json({
            message: "Order updated Successfully",
        });
    }
});

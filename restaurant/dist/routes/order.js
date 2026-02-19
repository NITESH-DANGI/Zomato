"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const isAuth_js_1 = require("../middleware/isAuth.js");
const order_js_1 = require("../controllers/order.js");
const router = express_1.default.Router();
router.get("/myorder", isAuth_js_1.isAuth, order_js_1.getMyOrders);
router.get("/:id", isAuth_js_1.isAuth, order_js_1.fetchSingleOrder);
router.post("/new", isAuth_js_1.isAuth, order_js_1.createOrder);
router.get("/payment/:id", order_js_1.fetchOrderForPayment);
router.get("/restaurant/:restaurantId", isAuth_js_1.isAuth, isAuth_js_1.isSeller, order_js_1.fetchRestaurantOrders);
router.put("/:orderId", isAuth_js_1.isAuth, isAuth_js_1.isSeller, order_js_1.updateOrderStatus);
router.put("/assign/rider", order_js_1.assignRiderToOrder);
router.get("/current/rider", order_js_1.getCurrentOrderForRider);
router.put("/update/status/rider", order_js_1.updateOrderStatusRider);
exports.default = router;

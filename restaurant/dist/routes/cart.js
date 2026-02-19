"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const isAuth_js_1 = require("../middleware/isAuth.js");
const cart_js_1 = require("../controllers/cart.js");
const router = express_1.default.Router();
router.post("/add", isAuth_js_1.isAuth, cart_js_1.addToCart);
router.get("/all", isAuth_js_1.isAuth, cart_js_1.fetchMyCart);
router.put("/inc", isAuth_js_1.isAuth, cart_js_1.incrementCartItem);
router.put("/dec", isAuth_js_1.isAuth, cart_js_1.decrementCartItem);
router.delete("/clear", isAuth_js_1.isAuth, cart_js_1.clearCart);
exports.default = router;

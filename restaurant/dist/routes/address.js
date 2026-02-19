"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const isAuth_js_1 = require("../middleware/isAuth.js");
const address_js_1 = require("../controllers/address.js");
const router = express_1.default.Router();
router.post("/new", isAuth_js_1.isAuth, address_js_1.addAddress);
router.delete("/:id", isAuth_js_1.isAuth, address_js_1.deleteAddress);
router.get("/all", isAuth_js_1.isAuth, address_js_1.getMyAddresses);
exports.default = router;

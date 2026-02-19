"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleMenuItemAvailability = exports.deleteMenuItem = exports.getAllItems = exports.addMenuItem = void 0;
const axios_1 = __importDefault(require("axios"));
const datauri_js_1 = __importDefault(require("../config/datauri.js"));
const trycatch_js_1 = __importDefault(require("../middleware/trycatch.js"));
const Restaurant_js_1 = __importDefault(require("../models/Restaurant.js"));
const Menuitems_js_1 = __importDefault(require("../models/Menuitems.js"));
exports.addMenuItem = (0, trycatch_js_1.default)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please login",
        });
    }
    const restaurant = await Restaurant_js_1.default.findOne({ ownerId: req.user._id });
    if (!restaurant) {
        return res.status(404).json({
            message: "NO Restaurant found",
        });
    }
    const { name, description, price } = req.body;
    if (!name || !price) {
        return res.status(400).json({
            message: "Name and price are required",
        });
    }
    const file = req.file;
    if (!file) {
        return res.status(400).json({
            message: "Please give image",
        });
    }
    const fileBuffer = (0, datauri_js_1.default)(file);
    if (!fileBuffer?.content) {
        return res.status(500).json({
            message: "Failed to create file buffer",
        });
    }
    const { data: uploadResult } = await axios_1.default.post(`${process.env.UTILS_SERVICE}/api/upload`, {
        buffer: fileBuffer.content,
    });
    const item = await Menuitems_js_1.default.create({
        name,
        description,
        price,
        restaurantId: restaurant._id,
        image: uploadResult.url,
    });
    res.json({
        message: "Item Added Successfully",
        item,
    });
});
exports.getAllItems = (0, trycatch_js_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            message: "Id is required",
        });
    }
    const items = await Menuitems_js_1.default.find({ restaurantId: id });
    res.json(items);
});
exports.deleteMenuItem = (0, trycatch_js_1.default)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please login",
        });
    }
    const { itemId } = req.params;
    if (!itemId) {
        return res.status(400).json({
            message: "Id is required",
        });
    }
    const item = await Menuitems_js_1.default.findById(itemId);
    if (!item) {
        return res.status(404).json({
            message: "No item found",
        });
    }
    const restaraunt = await Restaurant_js_1.default.findOne({
        _id: item.restaurantId,
        ownerId: req.user._id,
    });
    if (!restaraunt) {
        return res.status(404).json({
            message: "NO Restaurant found",
        });
    }
    await item.deleteOne();
    res.json({
        message: "Menu item deleted successfully",
    });
});
exports.toggleMenuItemAvailability = (0, trycatch_js_1.default)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please login",
        });
    }
    const { itemId } = req.params;
    if (!itemId) {
        return res.status(400).json({
            message: "Id is required",
        });
    }
    const item = await Menuitems_js_1.default.findById(itemId);
    if (!item) {
        return res.status(404).json({
            message: "No item found",
        });
    }
    const restaraunt = await Restaurant_js_1.default.findOne({
        _id: item.restaurantId,
        ownerId: req.user._id,
    });
    if (!restaraunt) {
        return res.status(404).json({
            message: "NO Restaurant found",
        });
    }
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json({
        message: `Item Marked as ${item.isAvailable ? "available" : "unavailable"}`,
        item,
    });
});

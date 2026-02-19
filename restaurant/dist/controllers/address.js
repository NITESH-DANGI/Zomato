"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyAddresses = exports.deleteAddress = exports.addAddress = void 0;
const trycatch_js_1 = __importDefault(require("../middleware/trycatch.js"));
const Address_js_1 = __importDefault(require("../models/Address.js"));
exports.addAddress = (0, trycatch_js_1.default)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const { mobile, formattedAddress, latitude, longitude } = req.body;
    if (!mobile ||
        !formattedAddress ||
        latitude === undefined ||
        longitude === undefined) {
        return res.status(400).json({
            message: "Please give all fields",
        });
    }
    const newAddress = await Address_js_1.default.create({
        userId: user._id.toString(),
        mobile,
        formattedAddress,
        location: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
        },
    });
    res.json({
        message: "Address Added successfully",
        address: newAddress,
    });
});
exports.deleteAddress = (0, trycatch_js_1.default)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            message: "id is required",
        });
    }
    const address = await Address_js_1.default.findOne({
        _id: id,
        userId: user._id.toString(),
    });
    if (!address) {
        return res.status(404).json({
            message: "Address not found",
        });
    }
    await address.deleteOne();
    res.json({
        message: "Address deleted Successfully",
    });
});
exports.getMyAddresses = (0, trycatch_js_1.default)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const addresses = await Address_js_1.default.find({
        userId: user._id.toString(),
    }).sort({ createdAt: -1 });
    res.json(addresses);
});

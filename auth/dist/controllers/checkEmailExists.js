"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEmailExists = void 0;
const trycatch_1 = __importDefault(require("../middlewares/trycatch"));
const User_1 = __importDefault(require("../model/User"));
exports.checkEmailExists = (0, trycatch_1.default)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    const user = await User_1.default.findOne({ email });
    if (user) {
        return res.status(200).json({ exists: true });
    }
    else {
        return res.status(200).json({ exists: false });
    }
});

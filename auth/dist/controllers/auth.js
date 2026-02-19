"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myProfile = exports.addUserRole = exports.loginUser = void 0;
const User_js_1 = __importDefault(require("../model/User.js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const trycatch_js_1 = __importDefault(require("../middlewares/trycatch.js"));
const googleConfig_js_1 = require("../config/googleConfig.js");
const axios_1 = __importDefault(require("axios"));
exports.loginUser = (0, trycatch_js_1.default)(async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({
            message: "Authorization code is required",
        });
    }
    const googleRes = await googleConfig_js_1.oauth2client.getToken(code);
    googleConfig_js_1.oauth2client.setCredentials(googleRes.tokens);
    const userRes = await axios_1.default.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
            Authorization: `Bearer ${googleRes.tokens.access_token}`,
        },
    });
    const { email, name, picture } = userRes.data;
    let user = await User_js_1.default.findOne({ email });
    if (!user) {
        user = await User_js_1.default.create({
            name,
            email,
            image: picture,
        });
    }
    const token = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SEC, {
        expiresIn: "15d",
    });
    res.status(200).json({
        message: "Logged Success",
        token,
        user,
    });
});
const allowedRoles = ["customer", "rider", "seller"];
exports.addUserRole = (0, trycatch_js_1.default)(async (req, res) => {
    if (!req.user?._id) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const { role } = req.body;
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            message: "Invalid role",
        });
    }
    const user = await User_js_1.default.findByIdAndUpdate(req.user._id, { role }, { new: true });
    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }
    const token = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SEC, {
        expiresIn: "15d",
    });
    res.json({ user, token });
});
exports.myProfile = (0, trycatch_js_1.default)(async (req, res) => {
    const user = req.user;
    res.json(user);
});

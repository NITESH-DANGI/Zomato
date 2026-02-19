"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const trycatch_1 = __importDefault(require("../middlewares/trycatch"));
const validator_1 = require("../utils/validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../model/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.register = (0, trycatch_1.default)(async (req, res) => {
    (0, validator_1.validate)(req.body);
    const { name, email, password } = req.body;
    req.body.password = await bcrypt_1.default.hash(password, 10);
    req.body.role = "user";
    const user = await User_1.default.create(req.body);
    const token = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SEC, {
        expiresIn: 60 * 60,
    });
    const reply = {
        email: user.email,
        _id: user._id,
    };
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
    });
    res.status(201).json({
        user: reply,
        message: "Registered Successfully",
    });
});
exports.login = (0, trycatch_1.default)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        throw new Error("Invalid Credentials");
    const user = await User_1.default.findOne({ email });
    if (!user)
        throw new Error("Invalid Credentials");
    const match = await bcrypt_1.default.compare(password, user.password);
    if (!match)
        throw new Error("Invalid Credentials");
    const token = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SEC, {
        expiresIn: 3600,
    });
    const reply = {
        email: user.email,
        _id: user._id,
    };
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
    });
    res.status(200).json({
        user: reply,
        message: "Login Successfully",
    });
});

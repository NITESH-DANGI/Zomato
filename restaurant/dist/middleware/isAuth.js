"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSeller = exports.isAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Please Login - No auth header",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                message: "Please Login - Token missing",
            });
            return;
        }
        const decodedValue = jsonwebtoken_1.default.verify(token, process.env.JWT_SEC);
        // const user = await User.findById(decodedValue.id);
        // if (!user) {
        //   res.status(401).json({ message: "User not found" });
        //   return;
        // }
        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({
                message: "Invalid token",
            });
            return;
        }
        req.user = decodedValue.user;
        next();
    }
    catch (error) {
        res.status(500).json({
            message: "Please Login - Jwt error",
        });
    }
};
exports.isAuth = isAuth;
const isSeller = async (req, res, next) => {
    const user = req.user;
    if (user && user.role !== "seller") {
        res.status(401).json({
            message: "You are not authorized seller"
        });
        return;
    }
    next();
};
exports.isSeller = isSeller;

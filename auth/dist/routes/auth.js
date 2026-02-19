"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_js_1 = require("../controllers/auth.js");
const isAuth_js_1 = require("../middlewares/isAuth.js");
const customAuth_js_1 = require("../controllers/customAuth.js");
const checkEmailExists_js_1 = require("../controllers/checkEmailExists.js");
const router = express_1.default.Router();
router.post("/check-email", checkEmailExists_js_1.checkEmailExists);
router.post("/sign", customAuth_js_1.register);
router.post("/login/local", customAuth_js_1.login);
router.post("/login/google", auth_js_1.loginUser);
router.put("/add/role", isAuth_js_1.isAuth, auth_js_1.addUserRole);
router.get("/me", isAuth_js_1.isAuth, auth_js_1.myProfile);
exports.default = router;

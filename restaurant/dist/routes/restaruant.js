"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const isAuth_1 = require("../middleware/isAuth");
const restaruant_1 = require("../controllers/restaruant");
const multer_1 = __importDefault(require("../middleware/multer"));
const router = express_1.default.Router();
router.post("/new", isAuth_1.isAuth, isAuth_1.isSeller, multer_1.default, restaruant_1.addRestaruant);
router.get("/my", isAuth_1.isAuth, isAuth_1.isSeller, restaruant_1.fetchMyRestaurant);
router.put("/status", isAuth_1.isAuth, isAuth_1.isSeller, restaruant_1.updateStatusRestaurant);
router.put("/edit", isAuth_1.isAuth, isAuth_1.isSeller, restaruant_1.updateRestaurant);
router.get("/all", isAuth_1.isAuth, restaruant_1.getNearbyRestaurant);
router.get("/:id", isAuth_1.isAuth, restaruant_1.fetchSingleRestaurant);
exports.default = router;

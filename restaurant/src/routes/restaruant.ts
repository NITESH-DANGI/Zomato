import express from "express";
import { isAuth, isSeller } from "../middleware/isAuth";
import { addRestaruant, fetchMyRestaurant, updateRestaurant, updateStatusRestaurant } from "../controllers/restaruant";
import uploadFile from "../middleware/multer";

const router = express.Router();

router.post("/new", isAuth, isSeller, uploadFile, addRestaruant);
router.get("/my", isAuth, isSeller, fetchMyRestaurant);
router.put("/status", isAuth, isSeller, updateStatusRestaurant)
router.put("/edit", isAuth, isSeller, updateRestaurant)

export default router;

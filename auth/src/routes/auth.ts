import express from "express";
import { addUserRole, loginUser, myProfile } from "../controllers/auth.js";
import { isAuth } from "../middlewares/isAuth.js";
import { login, register } from "../controllers/customAuth.js";
import { checkEmailExists } from "../controllers/checkEmailExists.js";

const router = express.Router();

router.post("/check-email",checkEmailExists)
router.post("/sign", register);
router.post("/login/local", login);
router.post("/login/google", loginUser);
router.put("/add/role", isAuth, addUserRole);
router.get("/me", isAuth, myProfile);

export default router;

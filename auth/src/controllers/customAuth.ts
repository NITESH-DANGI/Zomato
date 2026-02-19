import TryCatch from "../middlewares/trycatch.js";
import { validate } from "../utils/validator.js";
import jwt from "jsonwebtoken";
import User from "../model/User.js";
import bcrypt from "bcrypt";

export const register = TryCatch(async (req, res) => {
  validate(req.body);

  const { name, email, password } = req.body;

  req.body.password = await bcrypt.hash(password, 10);

  const user = await User.create(req.body);

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: 60 * 60,
  });

  const reply = {
    email: user.email,
    _id: user._id,
    role: user.role,
  };

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 1000,
  });

  res.status(201).json({
    user: reply,
    token,
    message: "Registered Successfully",
  });
});

export const login = TryCatch(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new Error("Please provide email and password");

  const user = await User.findOne({ email });

  if (!user) throw new Error("No user found, please sign up first");

  const match = await bcrypt.compare(password, user.password);

  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: 3600,
  });

  const reply = {
    email: user.email,
    _id: user._id,
    role: user.role,
  };

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 1000,
  });

  res.status(200).json({
    user: reply,
    token,
    message: "Login Successfully",
  });
});

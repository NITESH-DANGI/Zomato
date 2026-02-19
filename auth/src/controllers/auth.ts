import User from "../model/User";
import jwt from "jsonwebtoken";
import TryCatch from "../middlewares/trycatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { oauth2client } from "../config/googleConfig.js";
import axios from "axios";

export const loginUser = TryCatch(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      message: "Authorization code is required",
    });
  }

  if (!process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET === "YOUR_GOOGLE_CLIENT_SECRET") {
    console.error("CRITICAL: GOOGLE_CLIENT_SECRET is missing or using placeholder in .env");
    return res.status(500).json({
      message: "Server configuration error: Google OAuth secret is missing. Please update services/auth/.env",
    });
  }

  let googleRes;
  try {
    googleRes = await oauth2client.getToken(code);
  } catch (error) {
    console.error("Google Token Exchange Failed:", error);
    return res.status(401).json({
      message: "Google Login Failed: Invalid or expired authorization code",
    });
  }

  oauth2client.setCredentials(googleRes.tokens);

  const userRes = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${googleRes.tokens.access_token}`,
      },
    },
  );
  const { email, name, picture } = userRes.data;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      image: picture,
    });
  }

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "15d",
  });

  res.status(200).json({
    message: "Logged Success",
    token,
    user,
  });
});

const allowedRoles = ["customer", "rider", "seller"] as const;
type Role = (typeof allowedRoles)[number];

export const addUserRole = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user?._id) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const { role } = req.body as { role: Role };

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role },
    { new: true },
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const token = jwt.sign({ user: user.toObject() }, process.env.JWT_SEC as string, {
    expiresIn: "15d",
  });

  res.json({
    user: user.toObject(),
    token,
    message: "Role updated"
  });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  res.json(user);
});

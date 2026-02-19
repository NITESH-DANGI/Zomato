import TryCatch from "../middlewares/trycatch";
import User from "../model/User";

export const checkEmailExists = TryCatch(async(req, res) => {
    const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email });

  if (user) {
    return res.status(200).json({ exists: true });
  } else {
    return res.status(200).json({ exists: false });
  }
})
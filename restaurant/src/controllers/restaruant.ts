import axios from "axios";
import getBuffer from "../config/datauri";
import { AuthenticatedRequest } from "../middleware/isAuth";
import TryCatch from "../middleware/trycatch";
import Restaurant from "../models/Restaurant.js";
import jwt from "jsonwebtoken";

export const addRestaruant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    console.log("1. Add Restaurant request received");
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const existingRestaruant = await Restaurant.findOne({
      ownerId: user?._id,
    });

    if (existingRestaruant) {
      return res.status(400).json({
        message: "You already have a restaruant",
      });
    }

    const { name, description, latitude, longitude, formattedAddress, phone } =
      req.body;
    console.log("2. Body Data:", { name, latitude, longitude });
    if (!name || !latitude || !longitude) {
      return res.status(400).json({
        message: "Please give all details",
      });
    }

    const file = req.file;

    if (!file) {
      console.log("3. Buffer creation failed");
      return res.status(400).json({
        message: "Please give Restaruant image",
      });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer) {
      return res.status(500).json({
        message: "Failed to create file buffer",
      });
    }
    console.log(
      "4. Attempting to upload to Utils Service at:",
      process.env.UTILS_SERVICE,
    );

    // const { data: uploadResult } = await axios.post(
    //   `${process.env.UTILS_SERVICE}/api/upload`,
    //   { buffer: fileBuffer },
    // );
    // console.log("5. Upload Success:", uploadResult);
    // console.log("6. Creating Database Entry...");
    let uploadResult;

    try {
      const response = await axios.post(
        `${process.env.UTILS_SERVICE}/api/upload`,
        {
          buffer: fileBuffer.content || fileBuffer,
        },
        {
          headers: { "Content-Type": "application/json" },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        },
      );
      uploadResult = response.data;
      console.log("5. Upload Success:", uploadResult);
    } catch (error: any) {
      console.error("!!! Upload Error !!!");
      console.error("Message:", error.message);
      if (error.response) {
        console.error("Utils Service Response:", error.response.data);
        console.error("Status:", error.response.status);
      } else if (error.request) {
        console.error(
          "No response received from Utils Service (Is it running on port 5002?)",
        );
      }
      return res
        .status(500)
        .json({ message: "Image upload failed", error: error.message });
    }

    console.log("6. Creating Database Entry...");
    const restaurant = await Restaurant.create({
      name,
      description,
      phone,
      image: uploadResult.url,
      ownerId: user._id,
      autoLocation: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
        formattedAddress,
      },
      isVerified: false,
    });

    return res.status(201).json({
      message: "Restaurant created successfully",
      restaurant,
    });
  },
);
console.log("7. Restaurant Created in DB");

export const fetchMyRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please Login",
      });
    }
    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

    if (!restaurant) {
      return res.status(400).json({
        restaurant: null,
        message: "No Restaurant found",
      });
    }

    if (!req.user.restaurantId) {
      const token = jwt.sign(
        {
          user: {
            ...req.user,
            restaurantId: restaurant._id,
          },
        },
        process.env.JWT_SEC as string,
        {
          expiresIn: "15d",
        },
      );

      return res.json({ restaurant, token });
    }

    res.json({ restaurant });
  },
);

export const updateStatusRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(403).json({
        message: "Please Login",
      });
    }

    const { status } = req.body;

    if (typeof status !== "boolean") {
      return res.status(400).json({
        message: "Status must be boolean",
      });
    }
    const restaurant = await Restaurant.findOneAndUpdate(
      {
        ownerId: req.user._id,
      },
      {
        isOpen: status,
      },
      {
        new: true,
      },
    );

    if (!restaurant) {
      return res.status(400).json({
        message: "Restaurant not found",
      });
    }
    res.json({
      message: "Restaurant status Updated",
      restaurant,
    });
  },
);

export const updateRestaurant = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(403).json({
        message: "Please Login",
      });
    }
    const { name, description } = req.body;

    const restaurant = await Restaurant.findOneAndUpdate(
      {
        ownerId: req.user._id,
      },
      { name: name, description: description },
      {
        new: true,
      },
    );
    if (!restaurant) {
      return res.status(400).json({
        message: "Restaurant not found",
      });
    }
    res.json({
      message: "Restaurant Updated",
      restaurant,
    });
  },
);

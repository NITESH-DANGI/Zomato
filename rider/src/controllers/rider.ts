import TryCatch from "../middleware/trycatch.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../config/datauri.js";
import axios from "axios";
import { Rider } from "../model/Rider.js";

export const addRiderProfile = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "rider") {
      return res.status(403).json({
        message: "Only rider can create roder profile",
      });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "Rider Image is required",
      });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content) {
      return res.status(403).json({
        message: "Failed to gernate image buffer",
      });
    }
    const { data: uploadResult } = await axios.post(
      `${process.env.UTILS_SERVICE}/api/upload`,
      {
        Buffer: fileBuffer.content,
      },
    );
    const {
      phoneNumber,
      aadharNumber,
      drivingLicenseNumber,
      latitude,
      longitude,
    } = req.body;

    if (
      !phoneNumber ||
      !aadharNumber ||
      !drivingLicenseNumber ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingProfile = await Rider.findOne({
      userId: user._id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Rider profile already exists",
      });
    }

    const riderProfile = await Rider.create({
      userId: user._id,
      picture: uploadResult.url,
      phoneNumber,
      aadharNumber,
      drivingLicenseNumber,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      isAvailble: false,
      isVerified: false,
    });
    return res.status(201).json({
      message: "Rider profile create successfully",
      riderProfile,
    });
  },
);

export const fetchMyProfile = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const account = await Rider.findOne({ userId: user._id });
    res.json(account);
  },
);

export const toggleRiderAvailblity = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "rider") {
      return res.status(403).json({
        message: "Only rider can create roder profile",
      });
    }

    const { isAvailble, latitude, longitude } = req.body;

    if (typeof isAvailble !== "boolean") {
      return res.status(400).json({
        message: "isAvailble must be boolean",
      });
    }
    if (latitude === undefined || longitude === undefined) {
      return res.status(403).json({
        message: "Location is required",
      });
    }
    const rider = await Rider.findOne({
        userId: user._id,
    })
    if(!rider){
        return res.status(404).json({
          message: "Rider profile not found",
        });
    }
    if(isAvailble && !rider.isVerified){
        return res.status(403).json({
          message: "Rider is not verified",
        });
    }
    rider.isAvailble = isAvailble

    rider.location = {
        type: "Point",
        coordinates: [longitude, latitude]
    }

    rider.lastActiveAt = new Date();

    await rider.save()

    res.json({
        message: isAvailble? "Rider is now online": "Rider is now offline",
        rider,
    })
  },
);

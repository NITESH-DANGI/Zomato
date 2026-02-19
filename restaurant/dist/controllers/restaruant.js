"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSingleRestaurant = exports.getNearbyRestaurant = exports.updateRestaurant = exports.updateStatusRestaurant = exports.fetchMyRestaurant = exports.addRestaruant = void 0;
const axios_1 = __importDefault(require("axios"));
const datauri_1 = __importDefault(require("../config/datauri"));
const trycatch_1 = __importDefault(require("../middleware/trycatch"));
const Restaurant_js_1 = __importDefault(require("../models/Restaurant.js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.addRestaruant = (0, trycatch_1.default)(async (req, res) => {
    console.log("1. Add Restaurant request received");
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    const existingRestaruant = await Restaurant_js_1.default.findOne({
        ownerId: user?._id,
    });
    if (existingRestaruant) {
        return res.status(400).json({
            message: "You already have a restaruant",
        });
    }
    const { name, description, latitude, longitude, formattedAddress, phone } = req.body;
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
    const fileBuffer = (0, datauri_1.default)(file);
    if (!fileBuffer) {
        return res.status(500).json({
            message: "Failed to create file buffer",
        });
    }
    console.log("4. Attempting to upload to Utils Service at:", process.env.UTILS_SERVICE);
    // const { data: uploadResult } = await axios.post(
    //   `${process.env.UTILS_SERVICE}/api/upload`,
    //   { buffer: fileBuffer },
    // );
    // console.log("5. Upload Success:", uploadResult);
    // console.log("6. Creating Database Entry...");
    let uploadResult;
    try {
        const response = await axios_1.default.post(`${process.env.UTILS_SERVICE}/api/upload`, {
            buffer: fileBuffer.content || fileBuffer,
        }, {
            headers: { "Content-Type": "application/json" },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });
        uploadResult = response.data;
        console.log("5. Upload Success:", uploadResult);
    }
    catch (error) {
        console.error("!!! Upload Error !!!");
        console.error("Message:", error.message);
        if (error.response) {
            console.error("Utils Service Response:", error.response.data);
            console.error("Status:", error.response.status);
        }
        else if (error.request) {
            console.error("No response received from Utils Service (Is it running on port 5002?)");
        }
        return res
            .status(500)
            .json({ message: "Image upload failed", error: error.message });
    }
    console.log("6. Creating Database Entry...");
    const restaurant = await Restaurant_js_1.default.create({
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
});
console.log("7. Restaurant Created in DB");
exports.fetchMyRestaurant = (0, trycatch_1.default)(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Please Login",
        });
    }
    const restaurant = await Restaurant_js_1.default.findOne({ ownerId: req.user._id });
    if (!restaurant) {
        return res.status(400).json({
            restaurant: null,
            message: "No Restaurant found",
        });
    }
    if (!req.user.restaurantId) {
        const token = jsonwebtoken_1.default.sign({
            user: {
                ...req.user,
                restaurantId: restaurant._id,
            },
        }, process.env.JWT_SEC, {
            expiresIn: "15d",
        });
        return res.json({ restaurant, token });
    }
    res.json({ restaurant });
});
exports.updateStatusRestaurant = (0, trycatch_1.default)(async (req, res) => {
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
    const restaurant = await Restaurant_js_1.default.findOneAndUpdate({
        ownerId: req.user._id,
    }, {
        isOpen: status,
    }, {
        new: true,
    });
    if (!restaurant) {
        return res.status(400).json({
            message: "Restaurant not found",
        });
    }
    res.json({
        message: "Restaurant status Updated",
        restaurant,
    });
});
exports.updateRestaurant = (0, trycatch_1.default)(async (req, res) => {
    if (!req.user) {
        return res.status(403).json({
            message: "Please Login",
        });
    }
    const { name, description } = req.body;
    const restaurant = await Restaurant_js_1.default.findOneAndUpdate({
        ownerId: req.user._id,
    }, { name: name, description: description }, {
        new: true,
    });
    if (!restaurant) {
        return res.status(400).json({
            message: "Restaurant not found",
        });
    }
    res.json({
        message: "Restaurant Updated",
        restaurant,
    });
});
exports.getNearbyRestaurant = (0, trycatch_1.default)(async (req, res) => {
    const { latitude, longitude, radius = 5000, search = "" } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({
            Message: "Latitude and Longitude are required",
        });
    }
    const query = {
        isVerified: true,
    };
    if (search && typeof search === "string") {
        query.name = { $regex: search, $options: "i" };
    }
    const restaurants = await Restaurant_js_1.default.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [Number(longitude), Number(latitude)],
                },
                distanceField: "distance",
                maxDistance: Number(radius),
                spherical: true,
                query,
            },
        },
        {
            $sort: {
                isOpen: -1,
                distance: 1,
            },
        },
        {
            $addFields: {
                distanceKm: {
                    $round: [{ $divide: ["$distance", 1000] }, 2],
                },
            },
        },
    ]);
    res.json({
        success: true,
        count: restaurants.length,
        restaurants,
    });
});
exports.fetchSingleRestaurant = (0, trycatch_1.default)(async (req, res) => {
    const restaurant = await Restaurant_js_1.default.findById(req.params.id);
    res.json(restaurant);
});

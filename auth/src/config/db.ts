import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("connecting to mongodb...");
    mongoose.set("bufferCommands", false);
    await mongoose.connect(process.env.MONGO_URI as string, {
      dbName: "Zomato_Clone",
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    console.log("connected to mongodb");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
};

export default connectDB;

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.set("bufferCommands", false);
    await mongoose.connect(process.env.MONGO_URI as string, {
      dbName: "Zomato_Clone",
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    console.log("connected to mongodb");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;

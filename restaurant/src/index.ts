import express from "express";
import connectDB from "./config/db";
import dotenv from "dotenv";
import restaurantRoutes from "./routes/restaurant";
import itemRoutes from "./routes/menuitem";
import cartRoutes from "./routes/cart";
import cors from "cors";
import addressRoutes from "./routes/address";
import { connectRabbitMQ } from "./config/rabbitmq";
import { startPaymentConsumer } from "./config/payment.consumer";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

app.use("/api/restaurant", restaurantRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);

const startServer = async () => {
  try {
    await connectRabbitMQ();
    startPaymentConsumer();

    await connectDB();

    app.listen(PORT, () => {
      console.log(`Restaurant service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

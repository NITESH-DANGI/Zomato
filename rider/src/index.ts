import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import riderRoutes from "./routes/rider.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startOrderReadyConsumer } from "./config/orderReady.consumer.js";
dotenv.config();
await connectRabbitMQ();
startOrderReadyConsumer()

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5001;

app.use("/api/rider", riderRoutes);

const startServer = async () => {
  try {
    await connectRabbitMQ();

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
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import riderRoutes from "./routes/rider.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startOrderReadyConsumer } from "./config/orderReady.consumer.js";

dotenv.config();
console.log("started")
await connectRabbitMQ();
console.log("pro")
startOrderReadyConsumer();
console.log("1 start")
const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/rider", riderRoutes);
console.log("2 start")
app.listen(process.env.PORT, () => {
  console.log(`Rider service is running on port ${process.env.PORT}`);
  console.log("3 start")
  connectDB();
  console.log("4 start")

});


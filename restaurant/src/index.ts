import express from 'express'
import connectDB from './config/db';
import dotenv from 'dotenv'
dotenv.config()
import restaurantRoutes from "./routes/restaruant"
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5001;

app.use("/api/restaurant", restaurantRoutes)

app.listen(PORT, () => {
  console.log(`Restaurant service is running on port ${PORT}`);
  connectDB();
});
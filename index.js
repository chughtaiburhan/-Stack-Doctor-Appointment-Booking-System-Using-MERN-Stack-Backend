import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRoute from "./routes/doctorRoute.js";
import userRoute from "./routes/userRoutes.js";
// Load environment variables
dotenv.config();

// App config
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// DB Connect
mongoose.connect(process.env.MONGODB_URI, console.info("🚀 MongoDB Connected"));

// Cloudinary Connect
connectCloudinary();

// API endpoint
app.use("/doctors", doctorRoute);
app.use("/admin", adminRouter);
app.use("/user", userRoute);
// Server listening
app.listen(port, () => {
  console.info(`Server running on port: ${port}`);
});

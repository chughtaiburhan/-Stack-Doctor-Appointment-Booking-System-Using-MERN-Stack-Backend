import express from "express";
import {
  bookAppointment,
  cancelAppointment,
  getProfile,
  listAppointment,
  loginUser,
  registerUser,
  updateProfile,
} from "../controllers/userController.js";
import { autUser } from "../middleware/AuthUser.js";
const userRoute = express.Router();
import upload from "../controllers/multer.js";

userRoute.post("/register", registerUser); 
userRoute.post("/login", loginUser);
userRoute.get("/get-profile", autUser, getProfile);
userRoute.post("/update-profile", upload.single("image"), autUser, updateProfile);
userRoute.post("/book-appointment", autUser, bookAppointment);
userRoute.get("/appointment", autUser, listAppointment);
userRoute.post("/cancel-appointment", autUser, cancelAppointment);
export default userRoute;

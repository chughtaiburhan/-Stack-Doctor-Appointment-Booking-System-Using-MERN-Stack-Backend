import validator from "validator";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorSchema.js";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";

export const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({ success: false, message: "Mising Details" });
    }
    // Validating Email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a  valid email",
      });
    }

    if (password.length < 7) {
      return res.json({
        success: false,
        message: "Please enter a  strong password",
      });
    }
    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    const imageUrl = imageUpload.secure_url;

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };
    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();
    res.json({ success: true, message: "Doctor Added", newDoctor });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all doctors list for admin panel

export const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get appointment list with populated doctor and user info
export const appointmentAdmin = async (req, res) => {
  try {
    const appointment = await appointmentModel
      .find({})
      .populate("userId", "name image dob") // Only fetch necessary fields from user
      .populate("docId", "name image speciality"); // Only fetch necessary fields from doctor

    res.json({ success: true, appointment });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get total users and appointments
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();
    const totalAppointments = await appointmentModel.countDocuments();

    res.json({
      success: true,
      totalUsers,
      totalAppointments,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

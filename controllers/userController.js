import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorSchema.js";
import appointmentModel from "../models/appointmentModel.js"; 

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing details" });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing email or password" });
    }

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to get user profile data
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");
    res.json({ success: true, userData });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to update user profile
export const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file; // ✅ Fix here

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;
      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to book appointement
export const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor is not available" });
    }

    // Check if the slot is already booked
    let slot_booked = docData.slot_booked || {};

    if (slot_booked[slotDate]) {
      if (slot_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot is not available" });
      } else {
        slot_booked[slotDate].push(slotTime);
      }
    } else {
      slot_booked[slotDate] = [slotTime];
    }

    // Get user data
    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prepare appointment object with all required fields
    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      slotDate,
      slotTime,
      amount: docData.fees,
      date: new Date(),
      docDate: new Date().toISOString(), // or you can use slotDate
      userDate: new Date().toISOString(),
      cancelled: "false",
      payment: "pending", // or "not_paid" / "false"
      isCompleted: "false",
    };

    // Save appointment
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Update booked slot in doctor model
    await doctorModel.findByIdAndUpdate(docId, { slot_booked });

    res.json({ success: true, message: "Appointment has been booked" });
  } catch (error) {
    console.error("Appointment booking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// API to get user appointment for forntend my-appointment page 

export const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Populating doctor information (assuming `docId` in appointment is referring to Doctor model)
    const appointments = await appointmentModel
      .find({ userId })
      .populate('docId', 'name image address speciality'); // Adjust fields as per your schema
    
    res.json({ success: true, appointment: appointments });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel the appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // Fix: Compare ObjectId as string
    if (appointmentData.userId.toString() !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);

    if (doctorData) {
      let slot_booked = doctorData.slot_booked;
      slot_booked[slotDate] = slot_booked[slotDate].filter((e) => e !== slotTime);
      await doctorModel.findByIdAndUpdate(docId, { slot_booked });
    }

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};



// API to make a payment of appointment using razorpay

// const razorpayInstance=new razorpay({
//   key_id:"",
//   key_secret:"",
// })

// export const paymentRazorpay=async (req, res) => {
  
// }

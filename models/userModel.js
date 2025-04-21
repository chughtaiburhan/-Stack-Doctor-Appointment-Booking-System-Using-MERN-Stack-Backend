import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    image: {
      type: String,
      default:
        "blob:http://localhost:5173/8f4304b6-c091-43d0-b709-" // shortened
    },
    address: {
      line: { type: String, default: "" },
      line2: { type: String, default: "" }
    },
    gender: { type: String, default: "Not Selected" },
    dob: { type: String, default: "Not Selected" },
    phone: { type: String, default: "000000" }
  });
  

const userModel=mongoose.models.user ||  mongoose.model('user', userSchema);
export default userModel;
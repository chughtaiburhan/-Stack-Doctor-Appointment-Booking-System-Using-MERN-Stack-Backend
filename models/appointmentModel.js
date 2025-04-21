import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  docId: { type: mongoose.Schema.Types.ObjectId, ref: "doctor", required: true },
  slotDate: { type: String, required: true },
  slotTime: { type: String, required: true },
  userDate: { type: String, required: true },
  docDate: { type: String, required: true },
  amount: { type: String, required: true },
  date: { type: String, required: true },
  cancelled: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  payment: { type: String, enum: ["pending", "completed"], default: "pending" },
});

const appointmentModel =
  mongoose.models.appointment || mongoose.model("appointment", appointmentSchema);
export default appointmentModel;

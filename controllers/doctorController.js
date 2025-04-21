import doctorModel from "../models/doctorSchema.js"

export const changeAvailablity = async (req, res) => {
  try {
    const {docId} = req.body;
    const docData=await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {available: !docData.available});
    res.json({success:true, message:"Availablity Changed"})
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const doctorList=async (req, res) => {
  try {
    const doctors=await doctorModel.find({}).select(['-password', '-email']);
    res.json({success:true, doctors});
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
}

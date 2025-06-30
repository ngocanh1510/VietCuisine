import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  targetType: { type: String, required: true },
  targetId: { type: String, required: true },
  reason: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reportedAt: { type: Date, default: Date.now }
});

const ReportModel=mongoose.model("reports",ReportSchema)
export default ReportModel

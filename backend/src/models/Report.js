import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  targetType: {
      type: String,
      enum: ['posts', 'comments', 'reels'],
      required: true,
    },
  targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType' 
    },
  reason: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  reportedAt: { type: Date, default: Date.now }
});

const ReportModel=mongoose.model("reports",ReportSchema)
export default ReportModel

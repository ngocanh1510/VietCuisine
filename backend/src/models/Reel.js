import mongoose from "mongoose";

const ReelSchema = new mongoose.Schema({
    userOwner: {type: mongoose.Types.ObjectId, ref: User},
    caption: {type:String},
    video: {type:String, required:true}
},
{
    timestamps:true
})

const ReelModel=mongoose.model("reels",ReelSchema)
export default ReelModel

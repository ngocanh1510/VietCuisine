import mongoose from "mongoose";

const ReelSchema = new mongoose.Schema({
    userOwner: {type: mongoose.Types.ObjectId, ref:"users"},
    caption: {type:String},
    video: {type:String, required:true},
    commentsCount: {
        type: Number,
        default: 0
    },
    likesCount: {
        type: Number,
        default: 0
    },
},
{
    timestamps:true
})

const ReelModel=mongoose.model("reels",ReelSchema)
export default ReelModel

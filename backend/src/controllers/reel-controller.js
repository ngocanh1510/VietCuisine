import ReelModel from "../models/Reel";

export const getAllReel = async(req,res,next) =>{
    let reels;
    try {
        reels = await ReelModel.find().sort({ createdAt: -1 });
    } catch (err) {
        return console.log(err);
    }

    if (!recipes) {
        return res.status(500).json({ message: "Request Failed" });
    }
    return res.status(200).json({ reels });
};
import { ApiErr } from "../utils/apiErr.js";
import { asyncPromise } from "../utils/asyncPromise.js";
import { Like } from "../models/likes.models.js";
import { ApiRes } from "../utils/apiRes.js";
import mongoose from "mongoose";



const toggleVideoLike = asyncPromise(async(req,res)=>{
    const {videoId}=req.params;
    const user = req.user._id;
    if(!videoId || mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiErr(400,"Can't get the Video Id.");
    }
    if(!user){
        throw new ApiErr(404, "You are not logged in.");
    }
    const existingLike = await Like.findOne({videoId:videoId,likedBy:user});

    if(existingLike){
       const removedLike = await Like.findByIdAndDelete(existingLike._id);
       return res.status(200).json(new ApiRes(200,removedLike, "Unliked successfully."));
    }else{
        const liked=await Like.create({videoId:videoId,likedBy:user});
        return res.status(200).json(new ApiRes(200, liked, "Liked successfully."));
    }
});
const toggleCommentLike = asyncPromise(async(req,res)=>{
    const {commentId}=req.params;
    const user=req.user._id;
    if(!commentId || mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiErr(404,"Can't fetch the comment Id.");
    }
    if(!user){
        throw new ApiErr(404,"You are not logged in.");
    }
    const existingLike = await Like.findOne({commentId:commentId,likedBy:user});
    if(existingLike){
        const removedLike = await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiRes(200,removedLike,"Comment Unliked Successfully."));
    }else{
        const liked = await Like.create({commentId:commentId,likedBy:user});
        return res.status(200).json(new ApiRes(200, liked, "Comment Liked Successfully."));
    }

});
const toggleTweetLike = asyncPromise(async(req,res)=>{
    const {tweetId}=req.params;
    const user = req.user._id;
    if(!tweetId || mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiErr(404,"Can't fetch the Tweet Id.");
    }
    if(!user){
        throw new ApiErr(404,"You are not logged in.");
    }
    const {existingLike}=await Like.findOne({tweetId:tweetId,likedBy:user});
    if(existingLike){
        const removedLike=await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiRes(200,removedLike,"Tweet unliked Successfully."));
    }
    const liked=await Like.create({tweetId:tweetId,likedBy:user});
    return res.status(200).json(new ApiRes(200,liked,"Tweet liked Successfully."));
});
const getLikedVideos = asyncPromise(async(req,res)=>{
    const likedVideoDetails = await Like.aggregate({
        $match:{
            likedBy:req.user._id
        }
    },{
        $lookup:{
            from:"videos",
            localField:"videoId",
            foreignField:"_id",
            as:"likedVideosData"
        }
    },{$unwind:"$likedVideosData"},{
        $project:{
            _id:0,
            videoId:"$likedVideosData"
        }
    })

    return res.status(200).json(new ApiRes(200, likedVideoDetails, "Successfully fetched liked videos."));

});
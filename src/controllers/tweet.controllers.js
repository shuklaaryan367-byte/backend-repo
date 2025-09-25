import mongoose from "mongoose";
import { ApiRes } from "../utils/apiRes.js";
import { ApiErr } from "../utils/apiErr.js";
import { asyncPromise } from "../utils/asyncPromise";
import { Tweet } from "../models/tweets.models.js";



const addTweet=asyncPromise(async(req,res)=>{
    const {content}=req.body;
    const user = req.user._id;
    if(!user){
        throw new ApiErr(404, "User Id can't be found.");
    }
    if(!content){
        throw new ApiErr(404, "Enter something.")
    }
    try {
        const newTweet = await Tweet.create({
            content: content,
            owner: user
        });
        if(!newTweet){
            throw new ApiErr(401, "New tweet cannot be created.");
        }
        return res.status(200).json(new ApiRes(200, {newTweet}, "tweet created Successfully."));
    } catch (error) {
        throw new ApiErr(404, error?.message || "Can't create your Tweet.");
    }

});

const getUserTweets = asyncPromise(async(req,res)=>{
    const user = req.user._id;
    if(!user){
        throw new ApiErr(404,"You aren't logged in.");
    }
    const tweets = await Tweet.aggregate({
        $match:{
            owner:mongoose.Types.ObjectId(user)
        }
    },{$lookup:{
        from:"users",
        localField:"owner",
        foreignField:"_id",
        as:"TweetDetails"
    }},{$unwind:"$TweetDetails"},{
        $project:{
            userName:"$TweetDetails.userName",
            createdAt:1,
            updatedAt:1
        }
    })
    if(!tweets){
        throw new ApiErr(400,"Cant find your tweets.")
    }
    return res.status(200).json(new ApiRes(200,{tweets},"All tweets fetched successfully."));
    
});

const updateTweet=asyncPromise(async(req,res)=>{
    const content=req.body;
    const {tweetId}=req.params;
    if(!content){
        throw new ApiErr(404,"Enter Something.");
    }
    if(!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiErr(400,"Cannot continue with this.");
    }
    const {existingTweet}= await Tweet.findById(tweetId);

    if(!existingTweet.owner.toString()!==req.user._id){
        throw new ApiErr(404,"You cannot edit other's Tweets.");
    }
    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId,{$set:{
        content:content
    }},{new:true});
    if(!updatedTweet){
        throw new ApiErr(404,"Can't update your tweet.");
    }
    return res.status(200).json(new ApiRes(200,{updatedTweet},"Tweet updated Successfully."))
});

const deleteTweet = asyncPromise(async(req,res)=>{
    const {tweetId}=req.params;
    if(!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiErr(404,"Can't fetch tweet Id for deletion.")
    }
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if(!deletedTweet){
        throw new ApiErr(400, "Can't delete the Tweet.")
    }
    return res.status(200).json(new ApiRes(200,deletedTweet,"Tweet deleted successfully."));
});

export {addTweet,getUserTweets,updateTweet,deleteTweet};

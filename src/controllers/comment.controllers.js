import mongoose from "mongoose"
import {Comment} from "../models/comments.models.js"
import {ApiErr} from "../utils/apiErr.js"
import {ApiRes} from "../utils/apiRes.js"
import {asyncPromise} from "../utils/asyncPromise.js"
import { User } from "../models/user.models.js"


const getVideoComments = asyncPromise(async(req,res)=>{
    const {videoId} = req.params;
    const {page=1,limit=10} = req.query;

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiErr(400, "Can't get the video.");
    }

    const comment = await Comment.aggregate([{
        $match:{
            videoId:mongoose.Types.ObjectId(videoId)
        }
    },{
        $sort:{
            createdAt:-1
        }
    }]);

    const paginate = Comment.aggregatePaginate(comment,{page:parseInt(page), limit:parseInt(limit)});

    return res.status(200).json(new ApiRes(200, paginate, "Video Comments Fetches Successfully."));

});

const addComment = asyncPromise(async(req,res)=>{
    const content = req.body;
    if(!content){
        throw new ApiErr(404, "comment is empty.");
    }


    const {videoId} = req.params;
    if(!videoId || mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiErr(400,"Can't find the Video ID.");
    }

    const newComment = await User.create({
        userId : req.user._id,
        video:videoId,
        content:content
    });
    if(!newComment){
        throw new ApiErr(400,"Something went wrong.");
    }

    return res.status(200).json(new ApiRes(200, newComment[content], "Comment Added."));

});

const updateComment = asyncPromise(async(req,res)=>{
    const {content} = req.body;
    if(!content){
        throw new ApiErr(400, "Comment is required");
    }
    const {commentId}= req.params;
    if(!commentId || mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiErr(400, "cant fetch Comment ID.");
    }

    if(!commentId.owner.toString()!== req.user._id.toString()){
        throw new ApiErr(404,"You are not allowed to edit other's comment.");
    }


    const newComment = await Comment.findByIdAndUpdate(req.user._id,{set:{content}},{new:true});
    if(!newComment){
        throw new ApiErr(400, "Comment can't be added.");
    }

    return res.status(200).json(new ApiRes(200, newComment[content], "Comment updated successfully."));
    


});

const deleteComment = asyncPromise(async(req,res)=>{
    const {commentId} = req.params;
    const existingComment = await Comment.findById(commentId);
    if(!commentId || mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiErr(400,"Can't fetch the comment ID.");
    }
    if(existingComment.owner.toString()!==req.user._id.toString()){
        throw new ApiErr(400,"You are not allowed to delete other's comment.");
    }
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if(!deletedComment){
        throw new "Comment couldn't be deleted."
    }

    return res.status(200).json(new ApiRes(200, deletedComment, "Comment deleted Succesfully."));


})

export {getVideoComments,addComment,updateComment,deleteComment};
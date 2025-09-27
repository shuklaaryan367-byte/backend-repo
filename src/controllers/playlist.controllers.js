import mongoose from "mongoose";
import { asyncPromise } from "../utils/asyncPromise.js";
import { ApiErr } from "../utils/apiErr.js";
import { ApiRes } from "../utils/apiRes.js";
import { Playlist } from "../models/playlist.models.js";



const getUserPlaylist =asyncPromise(async(req,res)=>{
    const {userId}=req.params;
    if(!userId || userId.toString()!=req.user._id.toString()){
        throw new ApiErr(404,"Cant fetch the userid.")
    }
    const userPlaylist = await Playlist.find({
        owner:userId
    })
    if(!userPlaylist){
        throw new ApiErr(400,"Cant find the user's playlist.")
    }
    return res.status(200).json(new ApiRes(200,userPlaylist,"User's playlist fetched successfully."));


});
const getPlaylistbyid = asyncPromise(async(req,res)=>{
    const {playlistID}=req.params;
    if(!playlistID || !mongoose.Types.ObjectId.isValid(playlistID)){
        throw new ApiErr(404,"Cannot get the playlist.");
    }
    const playlistById = await Playlist.findById(playlistID);
    if(!playlistById){
        throw new ApiErr(400,"Cant find your playlist.");
    }
    return res.status(200).json(new ApiRes(200,playlistById,"Playlist by Id fetched successfully."));
});
const addVideoToPlaylist = asyncPromise(async(req,res)=>{
    const {playlistID,videoID}=req.params;
    if(!playlistID || !mongoose.Types.ObjectId.isValid(playlistID)){
        throw new ApiErr(400,"Cant get the playlist Id.");
    }
    if(!videoID || !mongoose.Types.ObjectId.isValid(videoID)){
        throw new ApiErr(400, "Cant get the Video Id.")
    }
    const newVideo = await Playlist.findByIdAndUpdate(playlistID,{$push:{video:videoID}}, {new:true});
    if(!newVideo){
        throw new ApiErr(400,"Cannot add the new video.");
    }
    return res.status(200).json(new ApiRes(200,newVideo,"New vidoe added to the playlist."));


});
const removeVideoFromPlaylist = asyncPromise(async(req,res)=>{
    const {playlistId, videoID} = req.params;
    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiErr(404,"cannot fetch teh Playlist Id.");
    }
    if(!videoID || !mongoose.Types.ObjectId.isValid(videoID)){
        throw new ApiErr(400,"cannot fetch video id.");
    }
    const removedvideo = await Playlist.findByIdAndUpdate(playlistId,{$pull:{video:videoID}},{new:true});
    if(!removedvideo){
        throw new ApiErr(404,"Not able to Remove thee video.");
    }
    return res.status(200).json(new ApiRes(200,removedvideo,"Video removed from the playlist successfully."));



});
const deletePlaylist = asyncPromise(async(req,res)=>{
    const {playlistId} = req.params;
    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiErr(404,"Cant get the playlist id.");
    }
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
    if(!deletedPlaylist){
        throw new ApiErr(400,"Not able to delete teh playlist.");
    }
    return res.status(200).json(new ApiRes(400,deletedPlaylist,"Playlist Deleted Successfully."));



});
const createPlaylist = asyncPromise(async(req,res)=>{
    const {name, description} = req.body;
    const {userId, videoId}=req.params;
    if(!userId || !mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiErr(400,"can't find user id.");
    }
    if(!name || !description){
        throw new ApiErr(404,"All fields are required.");
    }
    const newPlaylist = await Playlist.create({
        name:name,
        description:description,
        video:videoId,
        owner:userId
    });
    if(!newPlaylist){
        throw new ApiErr(400,"Was not able to create a new playlist.");
    }
    return res.status(200).json(new ApiRes(200,newPlaylist,"New Playlist created."));


});
const updatePlaylist = asyncPromise(async(req,res)=>{
    const {playlistId}=req.params;
    const {description,name}=req.body;
    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiErr(404,"Cant get the playlist id.");
    }
    if(!name || !description){
        throw new ApiErr(404,"All fields are required.");
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,{
        $set:{
            name:name,
            description:description,
        }
    },{new:true});
    if(!updatedPlaylist){
        throw new ApiErr(400,"Cant update the playlist.");
    }
    return res.status(200).json(new ApiRes(200,updatedPlaylist,"Playlist updated successfully."));



});

export {getPlaylistbyid,getUserPlaylist,addVideoToPlaylist,removeVideoFromPlaylist,deletePlaylist,createPlaylist,updatePlaylist};
import mongoose, { Schema } from "mongoose";
import { type } from "os";
const tweetSchema = new Schema({
    id:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    Content:{
        type:String,
        required:true
    }
},{timestamps:true});
export const Tweet = mongoose.model("Tweet", tweetSchema);
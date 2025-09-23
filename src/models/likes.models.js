import mongoose,{ Schema} from "mongoose";
import { type } from "os";
const likeSchema = new Schema({
    id:{
        type:String,
        required:true
    },
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"Tweet"
    }
},{timestamps:true});
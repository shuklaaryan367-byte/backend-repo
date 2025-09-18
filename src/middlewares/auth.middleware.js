import { ApiErr } from "../utils/apiErr";
import { asyncPromise } from "../utils/asyncPromise";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models";


export const verifyJWT = asyncPromise(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorisation")?.replace('Bearer ', "");
        if(!token){
            throw new ApiErr(401,"Unauthorised Request.");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiErr(401, "Invalid Access token");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiErr(401, error?.message || "Invalid Access Token");
    }

})
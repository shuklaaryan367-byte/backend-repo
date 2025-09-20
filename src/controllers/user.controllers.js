import dotenv from "dotenv";
dotenv.config();
import { ApiErr } from "../utils/apiErr.js";
import { asyncPromise } from "../utils/asyncPromise.js";
import { User } from "../models/user.models.js";
import { uploadCloud } from "../utils/cloudinary.js";
import {ApiRes} from "../utils/apiRes.js"
import { jwt } from "jsonwebtoken";


const GenerateAccessAndRefreshToken = async(userId)=>{
  try {
    const user = await User.findById(userId);
    // console.log(user);
    // console.log("this", this);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});
    return{accessToken,refreshToken};
  } catch (error) {
    throw new ApiErr(500, "Something went wrong while password validating");
  }
};


const registerUser = asyncPromise( async(req,res)=>{
   const {userName, password, email, fullName} = req.body;
   console.log("Email: ", email);

   if([userName, password, email, fullName].some((fields)=> fields?.trim()==="")){
        throw new ApiErr(400, "All Fields are Required.");
   }

   const existedUser = await User.findOne({
    $or:[{email},{userName}]
   });
   if(existedUser){
    throw new ApiErr(409, "User already exists.");
   }

   const avatarPath = req.files?.avatar[0]?.path;
  //  const coverImagePath = req.files?.coverImage?.path;
  let coverImagePath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
    coverImagePath = req.files.coverImage[0].path;
  }

  //  console.log(req.files);
  //  console.log(req.body);

   if(!avatarPath){
    throw new ApiErr(400, "AvatarPath is Required.");
   }
  const avatar = await uploadCloud(avatarPath);
  console.log(avatar);
  const coverImage = await uploadCloud(coverImagePath);

  if(!avatar){
    throw new ApiErr(400, "Avatar is required.");
  }

const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        password,
        email,
        userName:userName.toLowerCase()

})

const createdUser = await User.findById(user._id).select("-password -refreshToken");

if(!createdUser){
    throw new ApiErr(500, "Something went Wrong.");
}

return res.status(201).json(
    new ApiRes(200, createdUser, "User Registered Successfully.")
)




});
const loginUsers = asyncPromise(async(req, res)=>{
  const {userName, email, password} = req.body;
  if(!(userName || email)){
    throw new ApiErr(400, "Can't work w/o Email or UserName");
  }

  const user = await User.findOne({
    $or:[{userName}, {email}]
});

  if(!user){
    throw new ApiErr(404, "User doesn't exist.");
  }

 const isPasswordValid = await user.isPassworCorrect(password);

 if(!isPasswordValid){
  throw new ApiErr(404, "Check your password, it's wrong");
 }

 const {accessToken, refreshToken} = await GenerateAccessAndRefreshToken(user._id);
//  console.log(accessToken,"\n", refreshToken);

 const loggedUser = await User.findById(user._id).select("-password -refreshToken");
//  console.log(loggedUser,
//   typeof loggedUser
//  )

 const options = {
  httpOnly: true,
  secure: true,
  
 }
 return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json({statuscode:200, data:{loggedUser,accessToken,refreshToken}, message:"User Logged in Succesfully"});

 });

 

const logOut = asyncPromise(async(req,res)=>{

  await User.findByIdAndUpdate(req.user._id, 
    {$set: {
      refreshToken: undefined
    }},
    {
      new: true
    })

  const options = {
  httpOnly: true,
  secure: true,
  
 };

 return res.status(200).cookie("accessToken", options).cookie("refreshToken", options).json(new ApiRes(200, {}, "User logged out succesfully"));



  });

const refreshAccessToken = asyncPromise(async(req,res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;


  if(!incomingRefreshToken){
    throw new ApiErr(401, "Authentication Error.");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
  
    if(!decodedToken){
      throw new ApiErr(500, "Something went Wrong in Decoding");
    }
  
    const user = await User.findById(decodedToken?._id);
  
    if(!user){
      throw new ApiErr(401, "Invalid Refresh Token");
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiErr(400, "Refresh Token is Expired.");
    }
  
    
  
    options={
      httpOnly:true,
      secure:true
    }
  
    const {accessToken, newRefreshToken}=await GenerateAccessAndRefreshToken(user._id);
  
    return res.
    status(200).
    cookie("accesstoken",accessToken,options).
    cookie("newRefreshToken",newRefreshToken,options).
    json(new ApiRes(200, {accessToken,newRefreshToken}, "Access Token Refreshed."));
  } catch (error) {
    throw new ApiErr(401, error?.message || "Catch error...");
  }

});

const changeCurrentPassword = asyncPromise(async(req,res)=>{

  const {oldPassword, newPassword} = req.body;

  const user = await User.findById(req.user?._id);

  const isPassworCorrect = await user.isPassworCorrect(oldPassword);

  if(!isPassworCorrect){
    throw new ApiErr(400, "Invalid Old Password.");
  }

  user.password = newPassword;
  await user.save({validateBeforeSave:false});

  return res.
  status(200).
  json(new ApiRes(200, {}, "Password Changed Succesfully."));
});

const getCurrentUser = asyncPromise(async(req,res)=>{
  return res.
  status(200).
  json(new ApiRes(200,req.user,"Current User Fetched Succesfully."));
});

const updateAccountDetails = asyncPromise(async(req,res)=>{
  const {fullName, email} = req.body;
  if(!fullName || !email){
    throw new ApiErr(401, "All fields are required.");
  }

  const user = await User.findByIdAndUpdate(user.req?._id, {
    $set: {fullName: fullName,
             email: email}
  }, {new:true}).select("-password");

  return res.status(200).json(new ApiRes(200, user, "Details Updated Succesfully."));
});

const updateAvatar = asyncPromise(async(req,res)=>{
  const avatarPath = req.file?.path;

  if(!avatarPath){
    throw new ApiErr(500, "Some Error Occured, can't get Avatar.");
  }
  const avatar = await uploadCloud(avatarPath);
  if(!avatar.url){
    throw new ApiErr(500, "Can't get Avatar URL.")
  }

  const user = await User.findByIdAndUpdate(req.user?._id, {$set:{avatar: avatar.url}}, {new:true}).select("-password");

  return res.status.json(new ApiRes(200, user, "CoverImage Updated Successfully."));
});

const updateCoverImage = asyncPromise(async(req,res)=>{
  const coverImagePath = req.file?.path;

  if(!coverImagePath){
    throw new ApiErr(400, "Some Error Occured, can't get CoverImage.");
  }
  const coverImage = await updateCoverImage(coverImagePath);
  if(!coverImage.url){
    throw new ApiErr(400, "Can't get cover image URL.");
  }

  const user = await User.findByIdAndUpdate(req.user?._id,{$set:{
    coverImage: coverImage.url
  }},{new:true}).select("-password");

  return res.status.json(new ApiRes(200, user, "CoverImage Updated Successfully."));
});

const getUserChannelProfile = asyncPromise(async(req,res)=>{
  const {username} = req.params;

  if(!username?.trim()){
    throw new ApiErr(400, "Username not avialable.");
  }

  const channel  = await User.aggregate([{
    $match:{
      username:username?.toLowerCase()
    }
  },{
    $lookup:{
      from:"subscriptions",
      localField:"_id",
      foreignField:"channel",
      as:"subscribers"
    }
  },{
    $lookup:{
      from:"subscriptions",
      localField:"_id",
      foreignField:"subscriber",
      as:"subscribedTo"
    }
  },{
    $addFields:{
      subscribersCount:{
        $size: "$subscribers"
      },
      subscribedToCount:{
        $size:"$subscribedTo"
      },
      isSubscribed:{
        $cond:{
          if:{$in:[req?.user._id, "$subscribers.subscriber"]},
          then:true,
          else:false
        }
      }
    }
  },{
    $project:{
      fullName:1,
      username:1,
      subscribersCount:1,
      subscribedToCount:1,
      email:1,
      avatar:1,
      coverImage:1
    }
  }])

  if(!channel?.length){
  throw new ApiErr(404, "Channel Does not Exist.");
}

return res.status(200).json(new ApiRes(200, channel[0], "Channel Fetched Successfully."));


});


export {registerUser, loginUsers, logOut, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatar, updateCoverImage,getUserChannelProfile}; 
import { ApiErr } from "../utils/apiErr.js";
import { asyncPromise } from "../utils/asyncPromise.js";
import { User } from "../models/user.models.js";
import { uploadCloud } from "../utils/cloudinary.js";
import { ApiRes } from "../utils/apiRes.js";
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




})



export {registerUser};
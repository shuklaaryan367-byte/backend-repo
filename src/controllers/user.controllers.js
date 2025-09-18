import { ApiErr } from "../utils/apiErr.js";
import { asyncPromise } from "../utils/asyncPromise.js";
import { User } from "../models/user.models.js";
import { uploadCloud } from "../utils/cloudinary.js";


const GenerateAccessAndRefreshToken = async(userId)=>{
  try {
    const user = await User.findById(userId);
    const AccessToken = user.generateAccessToken();
    const RefreshToken = user.generateRefreshToken();
    user.refreshToken = RefreshToken;
    await user.save({validateBeforeSave: false});
    return{AccessToken,RefreshToken};
  } catch (error) {
    throw new ApiErr(500, "Something went wrong while password validating");
  }
}


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

 const isPasswordValid = user.isPassworCorrect(password);

 if(!isPasswordValid){
  throw new ApiErr(404, "Check your password, it's wrong");
 }

 const {accessToken, refreshToken} = await GenerateAccessAndRefreshToken(user._id);

 const loggedUser = await User.findById(user._id).select("-password -refreshToken");
//  console.log(loggedUser,
//   typeof loggedUser
//  )

 const options = {
  httpOnly: true,
  secure: true
 }
 return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json({statuscode:200, data:{loggedUser,accessToken,refreshToken}, message:"User Logged in Succesfully"});

 })

 

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
  secure: true
 };

 return res.status(200).cookie("accessToken", options).cookie("refreshToken", options).json(new ApiRes(200, {}, "User logged oot succesfully"));



  })



export {registerUser, loginUsers, logOut};
import { asyncPromise } from "../utils/asyncPromise.js";
const registerUser = asyncPromise( async(req,res)=>{
    res.status(200).json({
        message:"BSDK chodege"
    })
})

export {registerUser};
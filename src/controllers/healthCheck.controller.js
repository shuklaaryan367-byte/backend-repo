import mongoose from "mongoose";
import { ApiRes } from "../utils/apiRes.js";
import { asyncPromise } from "../utils/asyncPromise.js";

const healthCheck = asyncPromise(async(req,res)=>{
    return res.status(200).json(200,"OK", "Everything is Good, HealthCheck is working.")
});
export {healthCheck};
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(cookieParser());
app.use(cors({
    origin:process.env.ORIGIN,
    credentials:true
}));

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({
    extended:true,
    limit: "16kb"
}));

app.use(express.static("public"));


import userRouter from "./routes/user.routes.js";

app.use('/api/v1/user', userRouter)





const checkErr = ()=>{
    app.on('error', (error)=>{
    console.log('Error: ', error);
    throw error;
})
}


export default checkErr;
export {app};
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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
app.use(cookieParser());

const app = express();

const checkErr = ()=>{
    app.on('error', (error)=>{
    console.log('Error: ', error);
    throw error;
})
}


export default checkErr;
export {app};
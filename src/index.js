import dotenv from "dotenv";
dotenv.config();
import ConnectDB from "./db/index1.js";

import { app } from "./app.js";


ConnectDB()
.then(() =>{
    app.listen(process.env.PORT || 5000, ()=>{
        console.log('Server is Listening ')
    })
})
.catch(err=>{
    console.log('Error', err);
})




// import mongoose from "mongoose";
// import { DB_NAME } from "./constant.js";
// import express from "express";
// const app = express();
// ;(async()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
//         app.on("error", (error)=>{
//             console.log("ERROR",error);
//             throw error;
//         })

//         app.listen(process.env.PORT, ()=>{
//             console.log('LISTENING');
//         })
//     } catch (error) {
//         console.error("ERROR", error);
//         throw error;
//     }
// })()


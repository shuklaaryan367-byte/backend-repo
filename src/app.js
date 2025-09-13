import express from "express";

const app = express();

const checkErr = ()=>{
    app.on('error', (error)=>{
    console.log('Error: ', error);
    throw error;
})
}


export default checkErr;
export {app};
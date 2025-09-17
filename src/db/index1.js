import dotenv from "dotenv";
dotenv.config();
import mongoose from 'mongoose';

import { DB_NAME } from '../constant.js';
import checkErr from '../app.js';

console.log(process.env.MONGO_URL);

const ConnectDB = async()=>{
    try {
        const connect = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        console.log(`\n ${connect.connection.host}`);
        console.log(connect);
        checkErr();
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
} 

export default ConnectDB;
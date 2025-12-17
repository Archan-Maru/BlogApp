import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB=async ()=>{
     try {
            const coonectInstance= await  mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    
            console.log(`MongoDB connected \n
                DB INSTANCE: ${coonectInstance.connection.host}`)
    
        } catch (error) {
            console.log("MongoDB connection error",error); 
            process.exit(1);
        }
}

export default connectDB
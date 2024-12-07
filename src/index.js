import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path:'./.env'
})
connectDB()
.then(()=>{
    app.listen(process.env.PORT ,()=>{
        console.log("SERVER IS Runing",process.env.PORT)
    })
    app.on("error",(error)=>{
        console.log("ERROR",error);
        throw error;
    });
})
.catch((err)=>{
    console.log("MONGO DB CONNECTION FAILED",err);
})
// (async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("ERROR",error);
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`app is listening on ${process.env.PORT}`)
//         })
//     }catch(error){
//         console.error("Error",error)
//     }
// })
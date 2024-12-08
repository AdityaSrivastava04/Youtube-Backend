import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app=express();

app.use(cors({
    origin: process.env.CORS_ORI,
    credentials: true
}))
app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true,limit:"20kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import router from './routes/User.routes.js'
import VideoRouter from "./routes/Video.routes.js";
import commentRouter from "./routes/comment.routes.js";

app.use("/api/v1/users",router)
app.use("/api/v1/users",VideoRouter)
app.use("/api/v1/comment",commentRouter)
export {app}
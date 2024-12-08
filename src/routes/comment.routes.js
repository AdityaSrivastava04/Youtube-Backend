import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, getVideoComment } from "../controllers/comment.controller.js";

const commentRouter=Router()

commentRouter.route("/getComment").post(verifyJWT,getVideoComment)
commentRouter.route("/addComment").post(verifyJWT,addComment)

export default commentRouter

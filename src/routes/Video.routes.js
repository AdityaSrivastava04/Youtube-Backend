import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { DeleteVideo, getAllVideo, getVideo, togglePublicStatus, updatingThumbnail, updatingVideo, videoUpload } from "../controllers/videoUpload.controllers.js";
import uploadingVideo from "../middlewares/video.middleware.js";
const VideoRouter=Router()

VideoRouter.route("/uploadingVideo").post(verifyJWT,
    uploadingVideo.fields([
        {
            name:"Video",
            maxCount:1
        },{
            name:"Thumbnail",
            maxCount:1
        }
    ]),
videoUpload)
VideoRouter.route("/deleteVideo").post(verifyJWT,DeleteVideo)
VideoRouter.route("/updatingVideo").post(verifyJWT,updatingVideo)
VideoRouter.route("/updatingThumbnail").post(verifyJWT,uploadingVideo.fields([
    {
        name:"thumbnail",
        maxCount:1
    }
]),updatingThumbnail)
VideoRouter.route("/videoStatus").post(verifyJWT,togglePublicStatus)
VideoRouter.route("/searchVideo").put(getVideo)
VideoRouter.route("/videoStatus").post(verifyJWT,togglePublicStatus)
VideoRouter.route("/GettingVideo").post(verifyJWT,getAllVideo)

export default VideoRouter
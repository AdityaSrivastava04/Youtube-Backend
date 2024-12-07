import {Router} from "express";
import { getCurrentUser, getUserChannelProfile, getWacthHistory, LoggedOut, loginUser, refreshAccessToken, registerUser, updateUserAvatar, updateUserCoverImage, userAccountUpdate, userCurrentPasswordChange } from "../controllers/User.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { DeleteVideo, getAllVideo, getVideo, togglePublicStatus, updatingThumbnail, updatingVideo, videoUpload } from "../controllers/videoUpload.controllers.js";
import uploadingVideo from "../middlewares/video.middleware.js";

const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ])
    ,registerUser)
router.route("/login").post(loginUser)

//secued routes
router.route("/loggedOut").post(verifyJWT,LoggedOut)
router.route("/refreshToken").post(refreshAccessToken)
router.route("/changePassword").post(verifyJWT,userCurrentPasswordChange)
router.route("/currentUser").get(verifyJWT,getCurrentUser)
router.route("/updateAccount").patch(verifyJWT,userAccountUpdate)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:channelProfile").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWacthHistory)
router.route("/uploadingVideo").post(verifyJWT,
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
router.route("/deleteVideo").post(verifyJWT,DeleteVideo)
router.route("/updatingVideo").post(verifyJWT,updatingVideo)
router.route("/updatingThumbnail").post(verifyJWT,uploadingVideo.fields([
    {
        name:"thumbnail",
        maxCount:1
    }
]),updatingThumbnail)
router.route("/videoStatus").post(verifyJWT,togglePublicStatus)
router.route("/searchVideo").put(getVideo)
router.route("/videoStatus").post(verifyJWT,togglePublicStatus)
router.route("/GettingVideo").post(verifyJWT,getAllVideo)
export default router
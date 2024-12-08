import {Router} from "express";
import { getCurrentUser, getUserChannelProfile, getWacthHistory, LoggedOut, loginUser, refreshAccessToken, registerUser, updateUserAvatar, updateUserCoverImage, userAccountUpdate, userCurrentPasswordChange } from "../controllers/User.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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
export default router
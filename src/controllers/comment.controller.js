import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/Response.js";
import { Video } from "../modules/video.model.js";
import { Comments } from "../modules/comment.model.js";
import { asyncHandler } from "../utils/asynchandler.js";

const getVideoComment=asyncHandler(async(req,res)=>{
    // pehle video detail lena hai
    // phir hame us video ke comment nikalna hai find se bus
    const {video}=req.body
    if(!video){
        throw new ApiError(402,"Video Detail is reuire")
    }
    const findVideo=await Video.findOne({$or:[{title:video},{discription:video}]})
    if(!findVideo){
        throw new ApiError(403,"Video does not exit")
    }
    const gettingComment=await Comments.find({video:findVideo._id})
    if(!gettingComment){
        throw new ApiError(500,"Error while fetching video or ther is nothing")
    }
    return res
    .status(202)
    .json(new ApiResponse(202,{gettingComment},"All comment are found")) 
})
const addComment=asyncHandler(async(req,res)=>{
    const{comment,video}=req.body
    if(!video){
        throw new ApiError(400,"Video detail is reiure")
    }
    const videoID=await Video.findOne({$or:[{title:video},{discription:video}]})
    if(!videoID){
        throw new ApiError(403,"Video does not exit")
    }
    const uploadingcomment=await Comments.create({
        content:comment,
        video:videoID._id,
        owner:userAccountUpdate._id
    })
    if(!uploadingcomment){
        throw new ApiError(501,"Error while uloading comment")
    }
    return res
    .status(202)
    .json(202,{uploadingcomment},"Comment added")
})

export{
    getVideoComment,
    addComment
}
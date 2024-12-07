import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/Response.js";
import { cloudinaryDelete, cloudREsult } from "../utils/cloudinary.js";
import { Video } from "../modules/video.model.js";
import {User} from "../modules/user.model.js"

const videoUpload=asyncHandler(async(req,res)=>{
    // uesr se video lena hai
        // user se tumbnail
        // title
        // discription bhi lena hai
        // duration bhi lena hai
        // publish yes or no bhi lena hai
    // multer ke help se local server me upload karenga
    // fir check karna hai ki video hai ki nahi
    // fir usko cloudinary par upload karenga
    // fir usko url video module me upload kar denga 
    const{title,discription,duration,isPublished}=req.body
    console.log(title,discription,duration,isPublished)
    if(
        [title,discription,duration,isPublished].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"every thing is mandatory")
    }

    const video=req.files?.Video[0]?.path

    let thumbnail;
    if(req.files && Array.isArray(req.files.Thumbnail) && req.files.Thumbnail.length>0){
        thumbnail=req.files?.Thumbnail[0]?.path;
    }

    if(!video){
        throw new ApiError(400,"video is mandatory")
    }

    const videoUri=await cloudREsult(video)
    const thumbnailUri=await cloudREsult(thumbnail)
    console.log(videoUri)
    

    if(!videoUri && !thumbnailUri){
        throw new ApiError(400,"video is not uploaded")
    }

    const videoUpdatingDatabase= await Video.create({
        videoFiles:videoUri.url,
        thumbnail:thumbnailUri?.url ||"",
        title,
        discription,
        duration,
        isPublished,
        owner:req.user._id,
        public_id:videoUri.public_id
    })

    const videoUploadingConfirmation=await Video.findById(videoUpdatingDatabase)

    if(!videoUploadingConfirmation){
        throw new ApiError(500,"sorry video is not uploaded")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{videoUploadingConfirmation},"video is uploaded in database"))

})

const DeleteVideo=asyncHandler(async(req,res)=>{
    //user se video ka link req karna hai
    //fir us video ke link se database identify karenga
    //fir usko clodinary se delete karna hai
    // fir usko database se delete karna hai
    const {videoFiles,title}=req.body
    // console.log(videoFiles,title)
    if(!(videoFiles||title)){
        throw new ApiError(400,"Video link or Video name is reuire")
    }

    const findVideoFromDatabase=await Video.findOne({$or:[{videoFiles},{title}]})
    // console.log(findVideoFromDatabase)
    if(!findVideoFromDatabase){
        throw new ApiError(404,"Video is not present which you have given")
    }
    // console.log(findVideoFromDatabase.videoFiles)
    const deleteVideo=await cloudinaryDelete(findVideoFromDatabase.public_id)
    // console.log(deleteVideo)
    if(!deleteVideo){
        throw new ApiError(404,"Video is not deleted")
    }

    const databaseDeleteVideo= await Video.deleteOne({
        _id:findVideoFromDatabase._id
    })
    return res .status(200)
    .json(new ApiResponse(200,databaseDeleteVideo,"Video is deleted"))

})

const updatingVideo=asyncHandler(async(req,res)=>{
    const {title,duration,isPublished,discription}=req.body
    console.log(isPublished)
    if(!title&&!(duration||isPublished||discription)){
        throw new ApiError(401,"Any of field is reuiered to update")
    } 
    const videoFind=await Video.findOne({title})
    if(duration){
        videoFind.duration=duration
    }
    else if(isPublished!==undefined){
        videoFind.isPublished=isPublished
    }
    else if(duration){
        videoFind.duration=duration
    }

    const videoUpdatedData=await videoFind.save({validateBeforeSave:false})
    console.log(videoUpdatedData)

    return res
    .status (200)
    .json(new ApiResponse(200,videoUpdatedData,"video is updated"))
})

const updatingThumbnail=asyncHandler(async(req,res)=>{
    const{title}=req.body
    if(!title){
        throw new ApiError(403,"Video title is reuire")
    }
    console.log(req.files?.thumbnail[0]?.path)
    const thumbnail=req.files?.thumbnail[0]?.path
    // console.log(thumbnail)
    if(!thumbnail){
        throw new ApiError(403,"thumbnail is reuired")
    }
    // const deleteCLoudinaryOld=await cloudinaryDelete(thumbnail)
    // if(!deleteCLoudinaryOld){
    //     throw new ApiError(404,"Old thumbnail is not deleted")
    // }
    const thumbnailURL=await cloudREsult(thumbnail)
    if(!thumbnailURL){
        throw new ApiError(500,"thumbnail is not uploaded")
    }
    const findVideo=await Video.findOneAndUpdate({title},{$set:{thumbnail:thumbnail.url}},{new:true})
    if(!findVideo){
        throw new ApiError(404,"Video is not present in Databse")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,findVideo,"thumbnail updated"))

})
const togglePublicStatus=asyncHandler(async(req,res)=>{
    const{title,isPublished}=req.params
    if(!title){
        throw new ApiError(404,"title is reuired")
    }
    const findVideo=await Video.findByIdAndUpdate({title},{$set:{isPublished,}},{new:true})
    return res
    .status(202)
    .json(new ApiResponse(202,{findVideo},"Video status updated"))

})
const getVideo=asyncHandler(async(req,res)=>{
    const{query,title}=req.body
    if(!(query||title)){
        throw new ApiError(404,"Anything need to search")
    }
    // console.log(typeof(query))
    let findVideo
    if(title){
        findVideo=await Video.findOne({title:title})
    }else{
        findVideo=await Video.findOne({discription:query})
    }
    if(!findVideo){
        throw new ApiError(404,"No video found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{findVideo},"Video found"))
})

const getAllVideo=asyncHandler(async(req,res)=>{
    const{username}=req.body
    // console.log(username)
    if(!username){
        throw new ApiError(404,"user name is reuired")
    }
    const findUser=await User.findOne({username})
    console.log(findUser)
    if(!findUser){
        throw new ApiError(400,"USER does not exit")
    }
    const findVideo=await Video.findById({owner:findUser._id})
    if(!findUser){
        throw new ApiError(400,"error while finding video")
    }
    return res
    .status(200)
    .json(new ApiError(200,{findVideo},"All videos are"))
})
export {togglePublicStatus
    ,videoUpload
    ,DeleteVideo
    ,updatingVideo
    ,getVideo
    ,getAllVideo
    ,updatingThumbnail}
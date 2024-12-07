import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import {User} from "../modules/user.model.js";
import { cloudREsult} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Response.js";
import { Subscription } from "../modules/subcription.model.js";
import  jwt  from "jsonwebtoken";

const generateAccessAndRefreshToken= async(userId)=>{
    try {
        var user= await User.findById(userId)
        // console.log(typeof(user))
        const accesToken=await user.generateAccessToken()
        // console.log(accesToken)
        const refreshTokenGenrated=await user.generateRefreshToken()
        // console.log(refreshTokenGenrated)
        user.refreshToken=refreshTokenGenrated;
        // console.log(user.refreshToken)
        const savedata= await user.save({validateBeforeSave:false})
        // console.log(savedata)
        return {accesToken,refreshTokenGenrated}
    } catch (error) {
        throw new ApiError(500,"something went wrong while genrating refresh token")
    }
}

// Register User

const registerUser= asyncHandler(async(req,res)=>{
    //get user detail from frontend (from postman)
    //validation (is that information is correct or whether not empty)
    //check wethier account already exist or not
    //check for image ,check for avatar
    //upload them in cloudinary
    // create user object - create entry db
    //remove password anf reference token field from response
    //check for user creation
    //return response

    const {full_name,email,username,password}=req.body
    // if(fullName ===""){
    //     throw new ApiError(400,"full name is reuire")
    // }

    //new method to apply 
    if(
        [full_name,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"All field are reuired")
    }

    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })
    console.log(existedUser)

    if(existedUser){
        throw new ApiError(409,"User already exist")
    }


    const LocalPath=req.files?.avatar[0]?.path;
    // const coverImagePath=req.files?.coverImage[0]?.path;

    let coverImagePath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lenght>0){
        coverImagePath=req.files?.coverImage[0]?.path;
    }

    if(!LocalPath){
        throw new ApiError(400,"Avatar is mandatory")
    }

    //uploading in cloudinary

    const cloudinaryUpload= await cloudREsult(LocalPath)
    const coverImageUpload= await cloudREsult(coverImagePath)

    if(!cloudinaryUpload){
        throw new ApiError(400,"Avatar is mandatory")
    }

    //mongodb dataset creating

    const user=await User.create({
        full_name,
        avatar:cloudinaryUpload.url,
        coverImage:coverImageUpload?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    console.log(user);

    const userConfirmation = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!userConfirmation){
        throw new ApiError(500,"Error while registering the user")
    }
    
    return res.status(201).json(
        new ApiResponse(200,userConfirmation,"User registerd succesfuly")
    )
})

// Login User 

const loginUser=asyncHandler(async(req,res)=>{
    // req data from the user
    //validate through username/email
    //finding the user
    //password check
    //generate acces and refresh token
    //send token in secure_cookies

    const {email,username,password}=req.body

    // console.log(username)
    //checking input 

    if(!(email || username)){
        throw new ApiError(400,"Username or email is reuired")
    }

    // finding the user in data_base

    const find=await User.findOne({$or:[{email},{username}]})

    if(!find){
        throw new ApiError(404,"user does not exit")
    }

    const password_check=await find.isPasswordCorrect(password)

    if(!password_check){
        throw new ApiError(404,"Password in correct")
    }
    // console.log(find.refreshToken)
    const {accesToken,refreshTokenGenrated}=await generateAccessAndRefreshToken(find._id)
    // console.log(accesToken)
    // console.log(find.refreshToken)
    const loggedinUser=await User.findById(find._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accesToken",accesToken,options)
    .cookie("refrehToken",refreshTokenGenrated,options)
    .json(
        new ApiResponse(200,{user:loggedinUser,accesToken,refreshTokenGenrated},"User is Logged in")
    )
})

// LoggedOut

const LoggedOut=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $unset:{
                refereshToken:1
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refrehToken",options)
    .json(new ApiResponse(200,{},"user logged out"))

})

//Refresh Token 

const refreshAccessToken=asyncHandler(async(req,res)=>{
    try {
        const incoming_refreshToken=req.cookies.refershToken || req.body.refershToken
    
        if(!incoming_refreshToken){
            throw new ApiError(401,"Unautherize Token")
        }
        const decodecToken=jwt.verify(incoming_refreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user=await User.findById(decodecToken._id)
    
        if(!user){
            throw new ApiError(401,"invalid refresh token")
        }
        if(incoming_refreshToken !== user?.refereshToken){
            throw new ApiError(401,"invalid refresh token or is expired")
        }
        const options={
            httpOnly:true,
            secure:true
        }
        const {accesToken,newrefershToken}=await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accesToken,options)
        .cookie("refreshToken",newrefershToken,options)
        .json(
            new ApiResponse(
                200,
                {accesToken,refershToken:newrefershToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message ||"error")
    }
})

//changing password

const userCurrentPasswordChange=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body

    const user=await User.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"password is incorrect")
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"password is changed"))
})
const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"current user fetch succesfully"))
})

// Updating the user details

const userAccountUpdate=asyncHandler(async(req,res)=>{
    const {full_name,email}=req.body

    if(!(full_name||email)){
        throw new ApiError(400,"any field is reiured to update")
    }
    console.log(typeof(full_name))
    const userdetail=await User.findByIdAndUpdate(
        req.user?._id,
    {
        $set:{
            full_name,
            email:email
        }
    },{new:true}).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,userdetail,"Account details updated"))
})

// Updating the avatar image

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalpath=req.file?.path
    if(!avatarLocalpath){
        throw new ApiError(400,"Avatar is missing")
    }

    const cloudAvatar=await cloudREsult(avatarLocalpath)

    if(!avatar){
        throw new ApiError(500,"file is not uploaded")
    }

    const user=await User.findByIdAndUpdate(req.user?._id,{$set:avatar=cloudAvatar.url},{new:true})
    .select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Avatar updated succesfully updated"))
})

// updating cover Image 

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalpath=req.file?.path
    if(!coverImageLocalpath){
        throw new ApiError(400,"CoverImage is missing")
    }

    const cloudCoverImage=await cloudREsult(coverImageLocalpath)

    if(!cloudCoverImage){
        throw new ApiError(500,"file is not uploaded")
    }

    const user=await User.findByIdAndUpdate(req.user?._id,{$set:coverImage=cloudCoverImage.url},{new:true})
    .select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Cover Image  updated"))
})


// //aggregration pipeline

const getUserChannelProfile= asyncHandler(async(req,res)=>{
    const {username}=req.params

    if(!username?.trim()){
        throw new ApiError(400,"user is missing")
    }
    const channel= await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscriber"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribe_to"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size:"$subscriberss"
                },
                channelSubscribeTo:{
                    $size:"subscribe_to"
                },
                isSubscribed:{
                    if:{$in:[req.user?._id,"$subscriberss.subscriber"]},
                    then:true,
                    else:false
                }
            }
        },
        {
            $project:{
                full_name:1,
                username:1,
                subscriberCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                channelSubscribeTo:1,
                email:1
            }
        }
    ])
    if(!channel?.length){
        throw new ApiError(400,"Channel does not exit")
    }
    console.log(channel,"channel output");
    return res
    .status(200)
    .json(new ApiResponse(200,channel[0],"User channel fetch successfully"))

})


const getWacthHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"Owner",
                            pipeline:[
                                {
                                    $project:{
                                        full_name:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
        }}
    ])
    return res
    .status(200)
    .json(new ApiResponse(200,user[0].watchHistory,"watch history"))
})

export {
    registerUser,
    loginUser,
    LoggedOut,
    refreshAccessToken,
    userCurrentPasswordChange,
    getCurrentUser,
    userAccountUpdate,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWacthHistory
}
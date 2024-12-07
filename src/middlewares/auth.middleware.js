import { User } from "../modules/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accesToken || req.header("Authorization")?.replace("Bearer ","")
        // console.log(token)
        if(!token){
            throw new ApiError(404,"Unautherize acces")
        }
        const decodeToken=await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        // console.log(typeof(decodeToken))
        const user=await User.findById(decodeToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(404,"invalid Acces token")
        }
    
        req.user=user;
        next()
    } catch (error) {
        throw new ApiError(400,error?.message||"not logged out")
    }
})
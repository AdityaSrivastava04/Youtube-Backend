import { v2 as cloud} from "cloudinary";
import fs from "fs" //file system management reding or write the file system

cloud.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET,
});

const cloudREsult= async (localfilepath)=>{
    try {
        // console.log(localfilepath)
        if(!localfilepath) return null;
        const response=await cloud.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        //file has been uploaded
        // console.log("uploaded on cloudinary",response.url);
        fs.unlinkSync(localfilepath)
        return response
    } catch (error) {
        fs.unlinkSync(localfilepath) //remove the locally save tempary file as upload  operation get fail
        return null;
    }
}

const cloudinaryDelete= async(VideoID)=>{
    try{
        console.log(VideoID)
        const result=await cloud.uploader.destroy(VideoID, { resource_type: 'video' })
        console.log("cloudinary url deleted",result)
        return result
    }catch(error){
        console.error(error)
        return error
    }
}

export {cloudREsult,cloudinaryDelete}